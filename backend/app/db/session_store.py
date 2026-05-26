from datetime import datetime

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.config import get_settings
from app.db.models import Base, Material, Message, Session, new_id

NOTEBOOK_COLORS = frozenset(
    {"blue", "amber", "emerald", "violet", "rose", "slate", "teal", "coral"}
)


class SessionStore:
    def __init__(self) -> None:
        settings = get_settings()
        self.engine = create_async_engine(settings.database_url, echo=False)
        self._factory = async_sessionmaker(self.engine, expire_on_commit=False)

    async def init_db(self) -> None:
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await conn.run_sync(self._migrate)

    @staticmethod
    def _migrate(conn) -> None:
        from sqlalchemy import inspect

        insp = inspect(conn)
        if "sessions" not in insp.get_table_names():
            return
        cols = {c["name"] for c in insp.get_columns("sessions")}
        if "color" not in cols:
            conn.execute(
                text(
                    "ALTER TABLE sessions ADD COLUMN color VARCHAR(32) "
                    "NOT NULL DEFAULT 'blue'"
                )
            )

    async def create_session(
        self, title: str = "Nueva sesión", color: str = "blue"
    ) -> Session:
        async with self._factory() as db:
            session = Session(id=new_id(), title=title, color=color)
            db.add(session)
            await db.commit()
            await db.refresh(session)
            return session

    async def list_sessions(self) -> list[Session]:
        async with self._factory() as db:
            result = await db.execute(
                select(Session).order_by(Session.updated_at.desc())
            )
            return list(result.scalars().all())

    async def get_session(self, session_id: str) -> Session | None:
        async with self._factory() as db:
            return await db.get(Session, session_id)

    async def update_session_title(self, session_id: str, title: str) -> None:
        async with self._factory() as db:
            session = await db.get(Session, session_id)
            if session:
                session.title = title
                session.updated_at = datetime.utcnow()
                await db.commit()

    async def update_session_color(self, session_id: str, color: str) -> None:
        async with self._factory() as db:
            session = await db.get(Session, session_id)
            if session:
                session.color = color
                session.updated_at = datetime.utcnow()
                await db.commit()

    async def delete_session(self, session_id: str) -> list[Material]:
        async with self._factory() as db:
            session = await db.get(Session, session_id)
            if not session:
                return []
            result = await db.execute(
                select(Material).where(Material.session_id == session_id)
            )
            materials = list(result.scalars().all())
            await db.delete(session)
            await db.commit()
            return materials

    async def add_message(self, session_id: str, role: str, content: str) -> Message:
        async with self._factory() as db:
            msg = Message(session_id=session_id, role=role, content=content)
            db.add(msg)
            session = await db.get(Session, session_id)
            if session:
                session.updated_at = datetime.utcnow()
            await db.commit()
            await db.refresh(msg)
            return msg

    async def get_messages(self, session_id: str, limit: int = 40) -> list[Message]:
        async with self._factory() as db:
            result = await db.execute(
                select(Message)
                .where(Message.session_id == session_id)
                .order_by(Message.created_at.asc())
                .limit(limit)
            )
            return list(result.scalars().all())

    async def add_material(
        self,
        session_id: str,
        name: str,
        kind: str,
        source_path: str = "",
    ) -> Material:
        async with self._factory() as db:
            material = Material(
                session_id=session_id,
                name=name,
                kind=kind,
                source_path=source_path,
            )
            db.add(material)
            session = await db.get(Session, session_id)
            if session:
                session.updated_at = datetime.utcnow()
            await db.commit()
            await db.refresh(material)
            return material

    async def list_materials(self, session_id: str) -> list[Material]:
        async with self._factory() as db:
            result = await db.execute(
                select(Material)
                .where(Material.session_id == session_id)
                .order_by(Material.created_at.desc())
            )
            return list(result.scalars().all())

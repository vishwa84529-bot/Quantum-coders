from contextlib import contextmanager
from pathlib import Path
import sqlite3
from typing import Any, Iterator
from urllib.parse import urlparse

from app.config.settings import settings


class DatabaseSession:
    def __init__(self, connection: Any, dialect: str) -> None:
        self.connection = connection
        self.dialect = dialect

    def execute(self, query: str, params: tuple[Any, ...] = ()) -> Any:
        if self.dialect == "mysql":
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(query.replace("?", "%s"), params)
            return cursor

        return self.connection.execute(query, params)


def _database_path() -> Path:
    prefix = "sqlite:///"

    if not settings.database_url.startswith(prefix):
        raise ValueError("Only sqlite database URLs are supported, for example sqlite:///backend/alerts.db.")

    database = settings.database_url.removeprefix(prefix)
    if not database:
        raise ValueError("SQLite database URL must include a file path.")

    return Path(database)


def _database_dialect() -> str:
    if settings.database_url.startswith("mysql://") or settings.database_url.startswith("mysql+pymysql://"):
        return "mysql"

    return "sqlite"


def _mysql_connection() -> Any:
    try:
        import mysql.connector
    except ImportError as exc:
        raise RuntimeError("mysql-connector-python is required when DATABASE_URL uses mysql://.") from exc

    parsed = urlparse(settings.database_url)
    return mysql.connector.connect(
        host=parsed.hostname or "localhost",
        port=parsed.port or 3306,
        user=parsed.username,
        password=parsed.password,
        database=parsed.path.lstrip("/"),
    )


@contextmanager
def get_connection() -> Iterator[DatabaseSession]:
    dialect = _database_dialect()

    if dialect == "mysql":
        connection = _mysql_connection()
    else:
        db_path = _database_path()
        db_path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(db_path)
        connection.row_factory = sqlite3.Row

    try:
        yield DatabaseSession(connection, dialect)
        connection.commit()
    finally:
        connection.close()


def init_db() -> None:
    with get_connection() as connection:
        if connection.dialect == "mysql":
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS alerts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    location VARCHAR(120),
                    risk_level VARCHAR(32),
                    level VARCHAR(32) NOT NULL,
                    message TEXT NOT NULL,
                    latitude DOUBLE NOT NULL,
                    longitude DOUBLE NOT NULL,
                    timestamp VARCHAR(40),
                    created_at VARCHAR(40) NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS predictions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    location VARCHAR(120),
                    risk_level VARCHAR(32) NOT NULL,
                    risk_score INT NOT NULL,
                    probability VARCHAR(12),
                    rainfall DOUBLE NOT NULL,
                    water_level DOUBLE NOT NULL,
                    timestamp VARCHAR(40) NOT NULL
                )
                """
            )
            _ensure_mysql_alert_columns(connection)
            _ensure_mysql_prediction_columns(connection)
            return

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location TEXT,
                risk_level TEXT,
                level TEXT NOT NULL,
                message TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                timestamp TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location TEXT,
                risk_level TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                probability TEXT,
                rainfall REAL NOT NULL,
                water_level REAL NOT NULL,
                timestamp TEXT NOT NULL
            )
            """
        )
        _ensure_sqlite_alert_columns(connection)
        _ensure_sqlite_prediction_columns(connection)


def _ensure_sqlite_alert_columns(connection: DatabaseSession) -> None:
    rows = connection.execute("PRAGMA table_info(alerts)").fetchall()
    existing_columns = {row["name"] for row in rows}

    if "location" not in existing_columns:
        connection.execute("ALTER TABLE alerts ADD COLUMN location TEXT")

    if "risk_level" not in existing_columns:
        connection.execute("ALTER TABLE alerts ADD COLUMN risk_level TEXT")

    if "timestamp" not in existing_columns:
        connection.execute("ALTER TABLE alerts ADD COLUMN timestamp TEXT")


def _ensure_sqlite_prediction_columns(connection: DatabaseSession) -> None:
    rows = connection.execute("PRAGMA table_info(predictions)").fetchall()
    existing_columns = {row["name"] for row in rows}

    if "location" not in existing_columns:
        connection.execute("ALTER TABLE predictions ADD COLUMN location TEXT")

    if "probability" not in existing_columns:
        connection.execute("ALTER TABLE predictions ADD COLUMN probability TEXT")


def _ensure_mysql_prediction_columns(connection: DatabaseSession) -> None:
    for statement in (
        "ALTER TABLE predictions ADD COLUMN location VARCHAR(120)",
        "ALTER TABLE predictions ADD COLUMN probability VARCHAR(12)",
    ):
        try:
            connection.execute(statement)
        except Exception:
            # Column already exists on upgraded databases.
            pass


def _ensure_mysql_alert_columns(connection: DatabaseSession) -> None:
    for statement in (
        "ALTER TABLE alerts ADD COLUMN location VARCHAR(120)",
        "ALTER TABLE alerts ADD COLUMN risk_level VARCHAR(32)",
        "ALTER TABLE alerts ADD COLUMN timestamp VARCHAR(40)",
    ):
        try:
            connection.execute(statement)
        except Exception:
            # Column already exists on upgraded databases.
            pass

"""expand memories with subjective scoring fields

Revision ID: 20260312_000001
Revises: 40f43097368d
Create Date: 2026-03-12
"""

from collections.abc import Sequence

from alembic import op

revision: str = "20260312_000001"
down_revision: str | None = "40f43097368d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE memories
        ADD COLUMN IF NOT EXISTS event_importance DOUBLE PRECISION NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS self_relevance DOUBLE PRECISION NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS belief_confidence DOUBLE PRECISION NOT NULL DEFAULT 1,
        ADD COLUMN IF NOT EXISTS retrieval_count INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE NULL
        """
    )


def downgrade() -> None:
    op.drop_column("memories", "last_accessed_at")
    op.drop_column("memories", "retrieval_count")
    op.drop_column("memories", "belief_confidence")
    op.drop_column("memories", "self_relevance")
    op.drop_column("memories", "event_importance")

"""add memory streak fields

Revision ID: 20260312_000002
Revises: 20260312_000001
Create Date: 2026-03-12 02:00:00
"""

from alembic import op


revision = "20260312_000002"
down_revision = "20260312_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE memories
        ADD COLUMN IF NOT EXISTS streak_count INTEGER NOT NULL DEFAULT 1,
        ADD COLUMN IF NOT EXISTS last_tick_no INTEGER NULL
        """
    )


def downgrade() -> None:
    op.drop_column("memories", "last_tick_no")
    op.drop_column("memories", "streak_count")

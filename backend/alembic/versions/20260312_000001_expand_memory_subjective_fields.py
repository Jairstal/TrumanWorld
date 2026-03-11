"""expand memories with subjective scoring fields

Revision ID: 20260312_000001
Revises: 40f43097368d
Create Date: 2026-03-12
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260312_000001"
down_revision: str | None = "40f43097368d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "memories",
        sa.Column("event_importance", sa.Float(), nullable=False, server_default="0"),
    )
    op.add_column(
        "memories",
        sa.Column("self_relevance", sa.Float(), nullable=False, server_default="0"),
    )
    op.add_column(
        "memories",
        sa.Column("belief_confidence", sa.Float(), nullable=False, server_default="1"),
    )
    op.add_column(
        "memories",
        sa.Column("retrieval_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "memories",
        sa.Column("last_accessed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("memories", "last_accessed_at")
    op.drop_column("memories", "retrieval_count")
    op.drop_column("memories", "belief_confidence")
    op.drop_column("memories", "self_relevance")
    op.drop_column("memories", "event_importance")

"""add was_running_before_restart column

Revision ID: 20260307_000002
Revises: 20260307_000001
Create Date: 2026-03-07 15:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260307_000002"
down_revision = "20260307_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "simulation_runs",
        sa.Column("was_running_before_restart", sa.Boolean(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("simulation_runs", "was_running_before_restart")

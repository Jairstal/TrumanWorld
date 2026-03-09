"""add llm_calls table for token usage tracking

Revision ID: 20260309_000001
Revises: 20260308_000004
Create Date: 2026-03-09
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260309_000001"
down_revision: str | None = "20260308_000004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "llm_calls",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("simulation_runs.id"), nullable=False),
        sa.Column("agent_id", sa.String(64), sa.ForeignKey("agents.id"), nullable=True),
        sa.Column("task_type", sa.String(30), nullable=False),
        sa.Column("tick_no", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("input_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("output_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cache_read_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cache_creation_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_cost_usd", sa.Float(), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
    )
    op.create_index("ix_llm_calls_run_id", "llm_calls", ["run_id"])
    op.create_index("ix_llm_calls_run_id_agent_id", "llm_calls", ["run_id", "agent_id"])


def downgrade() -> None:
    op.drop_index("ix_llm_calls_run_id_agent_id", table_name="llm_calls")
    op.drop_index("ix_llm_calls_run_id", table_name="llm_calls")
    op.drop_table("llm_calls")

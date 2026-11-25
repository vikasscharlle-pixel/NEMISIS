"""Add detections table for Phase 2 Object Detection Engine.

Revision ID: 0002_detections_table
Revises: 0001_initial_schema
Create Date: 2026-11-25 20:04:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_detections_table"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "detections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("source_type", sa.String(length=16), nullable=False),
        sa.Column("source_path", sa.String(length=512), nullable=False),
        sa.Column("detection_class", sa.String(length=80), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("bounding_box", sa.JSON(), nullable=False),
        sa.Column("frame_index", sa.Integer(), nullable=True),
        sa.Column("video_id", sa.Integer(), nullable=True),
        sa.Column("annotated_image_path", sa.String(length=512), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["video_id"], ["videos.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_detections_id"), "detections", ["id"], unique=False)
    op.create_index(op.f("ix_detections_detection_class"), "detections", ["detection_class"], unique=False)
    op.create_index(op.f("ix_detections_created_at"), "detections", ["created_at"], unique=False)
    op.create_index(op.f("ix_detections_video_id"), "detections", ["video_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_detections_video_id"), table_name="detections")
    op.drop_index(op.f("ix_detections_created_at"), table_name="detections")
    op.drop_index(op.f("ix_detections_detection_class"), table_name="detections")
    op.drop_index(op.f("ix_detections_id"), table_name="detections")
    op.drop_table("detections")

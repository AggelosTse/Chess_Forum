"""seed_initial_roles

Revision ID: b094d9e377e5
Revises: 6c1f337fac8f
Create Date: 2026-07-06 09:45:02.956060

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column

# revision identifiers, used by Alembic.
revision = 'b094d9e377e5'
down_revision = '6c1f337fac8f'
branch_labels = None
depends_on = None


def upgrade():
    roles_table = table('role',
        column('name', sa.String)
    )

    op.bulk_insert(roles_table, [
        {'name': 'admin'},
        {'name': 'user'}
    ])


def downgrade():
    pass

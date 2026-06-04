import { randomUUID } from 'node:crypto'
import mongoose from 'mongoose'

const approvalSchema = new mongoose.Schema(
  {
    approval_id: {
      type: String,
      default: randomUUID,
      immutable: true,
      unique: true,
      index: true,
    },
    question_id: {
      type: String,
      required: true,
      index: true,
    },
    requested_by: {
      type: String,
      required: true,
    },
    requested_from: {
      type: String,
      required: true,
      index: true,
    },
    requested_from_name: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  {
    collection: 'approvals',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

export default mongoose.model('Approval', approvalSchema)

import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

// 消息接口
export interface IMessage extends Document {
  sender: IUser['_id'];
  recipient?: IUser['_id']; // 如果是私聊消息，则有接收者
  text: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 消息模式
const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// 创建消息模型
const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 用户接口
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 消息接口
export interface Message {
  _id: string;
  sender: User;
  recipient?: User;
  text: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // 用户相关API
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get('/users');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // 消息相关API
  async getPublicMessages(): Promise<Message[]> {
    const response: AxiosResponse<Message[]> = await this.api.get('/messages/public');
    return response.data;
  }

  async getPrivateMessages(userId: string, recipientId: string): Promise<Message[]> {
    const response: AxiosResponse<Message[]> = await this.api.get(`/messages/private/${userId}/${recipientId}`);
    return response.data;
  }

  async createMessage(messageData: { sender: string; recipient?: string; text: string; isPrivate?: boolean }): Promise<Message> {
    const response: AxiosResponse<Message> = await this.api.post('/messages', messageData);
    return response.data;
  }

  async deleteMessage(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/messages/${id}`);
    return response.data;
  }
}

// 创建单例实例
const apiService = new ApiService();
export default apiService;
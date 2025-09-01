import app from 'flarum/common/app';
import SimpleDepositRecord from '../models/SimpleDepositRecord';
import { SimpleDepositFormData } from '../../forum/components/deposit/types/interfaces';

export interface SimpleDepositService {
  /**
   * 创建新的存款记录
   */
  create(data: SimpleDepositFormData): Promise<SimpleDepositRecord>;

  /**
   * 获取用户的存款历史记录
   */
  getUserHistory(): Promise<SimpleDepositRecord[]>;

  /**
   * 获取所有存款记录（管理员）
   */
  getAll(filters?: SimpleDepositFilters): Promise<SimpleDepositRecord[]>;

  /**
   * 更新存款记录
   */
  update(recordId: number, data: Partial<SimpleDepositUpdateData>): Promise<SimpleDepositRecord>;

  /**
   * 审核存款记录（管理员）
   */
  approve(recordId: number, adminNotes?: string): Promise<SimpleDepositRecord>;

  /**
   * 拒绝存款记录（管理员）
   */
  reject(recordId: number, adminNotes?: string): Promise<SimpleDepositRecord>;
}

export interface SimpleDepositFilters {
  status?: string;
  user?: number;
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface SimpleDepositUpdateData {
  depositAddress?: string;
  qrCodeUrl?: string;
  userMessage?: string;
  status?: string;
  adminNotes?: string;
}

class SimpleDepositServiceImpl implements SimpleDepositService {
  async create(data: SimpleDepositFormData): Promise<SimpleDepositRecord> {
    const response = await app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/simple-deposit-records',
      body: {
        data: {
          type: 'simple-deposit-records',
          attributes: {
            depositAddress: data.depositAddress,
            qrCodeUrl: data.qrCodeUrl,
            userMessage: data.userMessage
          }
        }
      }
    });

    const record = app.store.pushPayload<SimpleDepositRecord>(response);
    return Array.isArray(record) ? record[0] : record;
  }

  async getUserHistory(): Promise<SimpleDepositRecord[]> {
    const response = await app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/simple-deposit-records',
      params: {
        include: 'user,processedByUser'
      }
    });

    return app.store.pushPayload<SimpleDepositRecord[]>(response);
  }

  async getAll(filters: SimpleDepositFilters = {}): Promise<SimpleDepositRecord[]> {
    const params: any = {
      include: 'user,processedByUser'
    };

    // 应用过滤器
    if (Object.keys(filters).length > 0) {
      params.filter = filters;
    }

    const response = await app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/simple-deposit-records',
      params
    });

    return app.store.pushPayload<SimpleDepositRecord[]>(response);
  }

  async update(recordId: number, data: Partial<SimpleDepositUpdateData>): Promise<SimpleDepositRecord> {
    const response = await app.request({
      method: 'PATCH',
      url: `${app.forum.attribute('apiUrl')}/simple-deposit-records/${recordId}`,
      body: {
        data: {
          type: 'simple-deposit-records',
          id: recordId,
          attributes: data
        }
      }
    });

    const record = app.store.pushPayload<SimpleDepositRecord>(response);
    return Array.isArray(record) ? record[0] : record;
  }

  async approve(recordId: number, adminNotes?: string): Promise<SimpleDepositRecord> {
    return this.update(recordId, {
      status: 'approved',
      adminNotes
    });
  }

  async reject(recordId: number, adminNotes?: string): Promise<SimpleDepositRecord> {
    return this.update(recordId, {
      status: 'rejected',
      adminNotes
    });
  }
}

// 导出单例服务实例
export const simpleDepositService: SimpleDepositService = new SimpleDepositServiceImpl();
export default simpleDepositService;
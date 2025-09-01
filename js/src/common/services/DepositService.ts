import app from 'flarum/common/app';
import DepositRecord from '../models/DepositRecord';
import { DepositFormData } from '../../forum/components/deposit/forms/DepositForm';

export interface DepositService {
  /**
   * 创建新的存款记录
   */
  create(data: DepositFormData): Promise<DepositRecord>;

  /**
   * 获取用户的存款历史记录
   */
  getUserHistory(): Promise<DepositRecord[]>;

  /**
   * 获取所有存款记录（管理员）
   */
  getAll(filters?: DepositFilters): Promise<DepositRecord[]>;

  /**
   * 更新存款记录
   */
  update(recordId: number, data: Partial<DepositUpdateData>): Promise<DepositRecord>;

  /**
   * 审核存款记录（管理员）
   */
  approve(recordId: number, adminNotes?: string): Promise<DepositRecord>;

  /**
   * 拒绝存款记录（管理员）
   */
  reject(recordId: number, adminNotes?: string): Promise<DepositRecord>;
}

export interface DepositFilters {
  status?: string;
  user?: number;
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface DepositUpdateData {
  depositAddress?: string;
  qrCodeUrl?: string;
  userMessage?: string;
  status?: string;
  adminNotes?: string;
}

class DepositServiceImpl implements DepositService {
  async create(data: DepositFormData): Promise<DepositRecord> {
    const response = await app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/deposit-records',
      body: {
        data: {
          type: 'deposit-records',
          attributes: {
            depositAddress: data.depositAddress,
            qrCodeUrl: data.qrCodeUrl,
            userMessage: data.userMessage
          }
        }
      }
    });

    const record = app.store.pushPayload<DepositRecord>(response);
    return Array.isArray(record) ? record[0] : record;
  }

  async getUserHistory(): Promise<DepositRecord[]> {
    const response = await app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/deposit-records',
      params: {
        include: 'user,processedByUser'
      }
    });

    return app.store.pushPayload<DepositRecord[]>(response);
  }

  async getAll(filters: DepositFilters = {}): Promise<DepositRecord[]> {
    const params: any = {
      include: 'user,processedByUser'
    };

    // 应用过滤器
    if (Object.keys(filters).length > 0) {
      params.filter = filters;
    }

    const response = await app.request({
      method: 'GET',
      url: app.forum.attribute('apiUrl') + '/deposit-records',
      params
    });

    return app.store.pushPayload<DepositRecord[]>(response);
  }

  async update(recordId: number, data: Partial<DepositUpdateData>): Promise<DepositRecord> {
    const response = await app.request({
      method: 'PATCH',
      url: `${app.forum.attribute('apiUrl')}/deposit-records/${recordId}`,
      body: {
        data: {
          type: 'deposit-records',
          id: recordId,
          attributes: data
        }
      }
    });

    const record = app.store.pushPayload<DepositRecord>(response);
    return Array.isArray(record) ? record[0] : record;
  }

  async approve(recordId: number, adminNotes?: string): Promise<DepositRecord> {
    return this.update(recordId, {
      status: 'approved',
      adminNotes
    });
  }

  async reject(recordId: number, adminNotes?: string): Promise<DepositRecord> {
    return this.update(recordId, {
      status: 'rejected',
      adminNotes
    });
  }
}

// 导出单例服务实例
export const depositService: DepositService = new DepositServiceImpl();
export default depositService;
import app from "flarum/common/app";
import DepositRecord from "../models/DepositRecord";
import { DepositFormData } from "../../forum/components/deposit/forms/DepositForm";
import { ApiPayloadSingle } from "flarum/common/Store";

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
   * 查找存款记录
   */
  find(params?: any): Promise<DepositRecord[]>;

  /**
   * 更新存款记录
   */
  update(
    recordId: number,
    data: Partial<DepositUpdateData>
  ): Promise<DepositRecord>;

  /**
   * 删除存款记录
   */
  delete(record: DepositRecord): Promise<void>;

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
  platformId?: number;
  userMessage?: string;
  status?: string;
  adminNotes?: string;
}

class DepositServiceImpl implements DepositService {
  async create(data: DepositFormData): Promise<DepositRecord> {
    // Extract platformId from the selected platform
    if (!data.selectedPlatform) {
      throw new Error('Selected platform is required');
    }

    const platformId = parseInt(data.selectedPlatform.id() as string);
    if (!platformId) {
      throw new Error('Platform ID is required');
    }

    const response = await app.request({
      method: "POST",
      url: app.forum.attribute("apiUrl") + "/deposit-records",
      body: {
        data: {
          type: "deposit-records",
          attributes: {
            platformId: platformId,
            userMessage: data.userMessage,
          },
        },
      },
    });

    const record = app.store.pushPayload(
      response as ApiPayloadSingle
    ) as DepositRecord;
    return Array.isArray(record) ? record[0] : record;
  }

  async getUserHistory(): Promise<DepositRecord[]> {
    const response = await app.request({
      method: "GET",
      url: app.forum.attribute("apiUrl") + "/deposit-records",
      params: {
        include: "user,processedByUser",
      },
    });

    return app.store.pushPayload(
      response as ApiPayloadSingle
    ) as unknown as DepositRecord[];
  }

  async getAll(filters: DepositFilters = {}): Promise<DepositRecord[]> {
    const params: any = {
      include: "user,processedByUser",
    };

    // 应用过滤器
    if (Object.keys(filters).length > 0) {
      params.filter = filters;
    }

    const response = await app.request({
      method: "GET",
      url: app.forum.attribute("apiUrl") + "/deposit-records",
      params,
    });

    return app.store.pushPayload(
      response as ApiPayloadSingle
    ) as unknown as DepositRecord[];
  }

  async update(
    recordId: number,
    data: Partial<DepositUpdateData>
  ): Promise<DepositRecord> {
    const response = await app.request({
      method: "PATCH",
      url: `${app.forum.attribute("apiUrl")}/deposit-records/${recordId}`,
      body: {
        data: {
          type: "deposit-records",
          id: recordId,
          attributes: data,
        },
      },
    });

    const record = app.store.pushPayload(
      response as ApiPayloadSingle
    ) as DepositRecord;
    return Array.isArray(record) ? record[0] : record;
  }

  async approve(recordId: number, adminNotes?: string): Promise<DepositRecord> {
    return this.update(recordId, {
      status: "approved",
      adminNotes,
    });
  }

  async reject(recordId: number, adminNotes?: string): Promise<DepositRecord> {
    return this.update(recordId, {
      status: "rejected",
      adminNotes,
    });
  }

  async find(params: any = {}): Promise<DepositRecord[]> {
    // Ensure we only include valid relationships for DepositRecord
    const validParams = { ...params };
    if (validParams.include) {
      // Filter out 'platform' from include since DepositRecord doesn't have platform relationship
      validParams.include = validParams.include
        .split(',')
        .filter((rel: string) => rel.trim() !== 'platform')
        .join(',');
      
      // If no valid includes remain, remove the include parameter
      if (!validParams.include) {
        delete validParams.include;
      }
    }

    const response = await app.request({
      method: "GET",
      url: app.forum.attribute("apiUrl") + "/deposit-records",
      params: validParams,
    });

    return app.store.pushPayload(
      response as ApiPayloadSingle
    ) as unknown as DepositRecord[];
  }

  async delete(record: DepositRecord): Promise<void> {
    await app.request({
      method: "DELETE",
      url: `${app.forum.attribute("apiUrl")}/deposit-records/${record.id()}`,
    });

    app.store.remove(record);
  }
}

// 导出单例服务实例
export const depositService: DepositService = new DepositServiceImpl();
export default depositService;

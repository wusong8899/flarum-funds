import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import icon from 'flarum/common/helpers/icon';
import humanTime from 'flarum/common/helpers/humanTime';
import m from 'mithril';
import type Mithril from 'mithril';
import ConfirmModal from '../../../common/components/shared/ConfirmModal';

interface DepositRecord {
  id(): string | number;
  userId(): number;
  platformId(): number;
  platformAccount(): string;
  realName?(): string;
  amount(): number;
  depositTime(): Date;
  screenshotUrl?(): string;
  userMessage?(): string;
  status(): string;
  processedAt?(): Date;
  processedBy?(): number;
  adminNotes?(): string;
  creditedAmount?(): number;
  createdAt(): Date;
  updatedAt(): Date;
  user?(): any;
  platform?(): any;
  processedByUser?(): any;
  isPending(): boolean;
  isApproved(): boolean;
  isRejected(): boolean;
}

interface DepositRecordManagementSectionAttrs {
  records: DepositRecord[];
  platforms: any[];
  loading?: boolean;
  onApproveRecord: (record: DepositRecord, creditedAmount?: number, notes?: string) => Promise<void>;
  onRejectRecord: (record: DepositRecord, reason: string) => Promise<void>;
  onDeleteRecord: (record: DepositRecord) => Promise<void>;
}

interface DepositRecordManagementSectionState {
  processingRecords: Set<string | number>;
}

export default class DepositRecordManagementSection extends Component<
  DepositRecordManagementSectionAttrs,
  DepositRecordManagementSectionState
> {
  public state: DepositRecordManagementSectionState = {
    processingRecords: new Set()
  };

  view(vnode: Mithril.Vnode<DepositRecordManagementSectionAttrs>): Mithril.Children {
    const { records, platforms, loading } = vnode.attrs;

    if (loading) {
      return (
        <div className="DepositRecordManagementSection">
          <div className="DepositRecordManagementSection-header">
            <h3>{app.translator.trans('withdrawal.admin.deposit.records.title')}</h3>
          </div>
          <LoadingIndicator />
        </div>
      );
    }

    return (
      <div className="DepositRecordManagementSection">
        <div className="DepositRecordManagementSection-header">
          <h3>{app.translator.trans('withdrawal.admin.deposit.records.title')}</h3>
          <div className="DepositRecordManagementSection-stats">
            <span className="DepositRecordManagementSection-count">
              {app.translator.trans('withdrawal.admin.deposit.records.total_count', {
                count: records.length
              })}
            </span>
            <span className="DepositRecordManagementSection-pending">
              {app.translator.trans('withdrawal.admin.deposit.records.pending_count', {
                count: records.filter(r => r.isPending()).length
              })}
            </span>
          </div>
        </div>

        <div className="DepositRecordManagementSection-content">
          {records.length === 0 ? (
            <div className="DepositRecordManagementSection-empty">
              <div className="DepositRecordManagementSection-emptyIcon">
                {icon('fas fa-receipt')}
              </div>
              <h4>{app.translator.trans('withdrawal.admin.deposit.records.empty.title')}</h4>
              <p>{app.translator.trans('withdrawal.admin.deposit.records.empty.description')}</p>
            </div>
          ) : (
            <div className="DepositRecordManagementSection-list">
              {records.map(record => this.renderRecord(record, platforms, vnode.attrs))}
            </div>
          )}
        </div>
      </div>
    );
  }

  private renderRecord(
    record: DepositRecord,
    platforms: any[],
    attrs: DepositRecordManagementSectionAttrs
  ): Mithril.Children {
    const recordId = record.id();
    const isProcessing = this.state.processingRecords.has(recordId);
    const platform = this.findPlatform(platforms, record.platformId());
    const user = record.user?.();
    const status = record.status();
    const depositTime = record.depositTime();
    const createdAt = record.createdAt();

    return (
      <div key={`record-${recordId}`} className={`DepositRecordItem status-${status}`}>
        <div className="DepositRecordItem-header">
          <div className="DepositRecordItem-user">
            <span className="DepositRecordItem-username">
              {user?.displayName?.() || 'Unknown User'}
            </span>
            <span className="DepositRecordItem-userId">
              ID: {record.userId()}
            </span>
          </div>
          
          <div className="DepositRecordItem-amount">
            <span className="DepositRecordItem-amountValue">
              {record.amount()} {platform?.symbol?.() || ''}
            </span>
            <div className={`DepositRecordItem-status status-${this.getStatusColor(status)}`}>
              {this.renderStatusIcon(status)}
              {this.getStatusText(status)}
            </div>
          </div>
        </div>

        <div className="DepositRecordItem-details">
          <div className="DepositRecordItem-row">
            <span className="DepositRecordItem-label">Platform:</span>
            <span className="DepositRecordItem-value">
              {platform?.name?.() || 'Unknown Platform'} {platform?.network?.() ? `(${platform.network()})` : ''}
            </span>
          </div>
          
          <div className="DepositRecordItem-row">
            <span className="DepositRecordItem-label">Platform Account:</span>
            <span className="DepositRecordItem-value">{record.platformAccount()}</span>
          </div>
          
          {record.realName?.() && (
            <div className="DepositRecordItem-row">
              <span className="DepositRecordItem-label">Real Name:</span>
              <span className="DepositRecordItem-value">{record.realName()}</span>
            </div>
          )}
          
          <div className="DepositRecordItem-row">
            <span className="DepositRecordItem-label">Deposit Time:</span>
            <span className="DepositRecordItem-value">
              {depositTime.toLocaleDateString()} {depositTime.toLocaleTimeString()}
            </span>
          </div>
          
          <div className="DepositRecordItem-row">
            <span className="DepositRecordItem-label">Submitted:</span>
            <span className="DepositRecordItem-value">
              {humanTime(createdAt)}
            </span>
          </div>
          
          {record.userMessage?.() && (
            <div className="DepositRecordItem-row">
              <span className="DepositRecordItem-label">Message:</span>
              <span className="DepositRecordItem-value">{record.userMessage()}</span>
            </div>
          )}
          
          {record.screenshotUrl?.() && (
            <div className="DepositRecordItem-row">
              <span className="DepositRecordItem-label">Screenshot:</span>
              <a
                href={record.screenshotUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="DepositRecordItem-link"
              >
                View Screenshot {icon('fas fa-external-link-alt')}
              </a>
            </div>
          )}

          {record.processedAt?.() && (
            <div className="DepositRecordItem-processed">
              <div className="DepositRecordItem-row">
                <span className="DepositRecordItem-label">Processed:</span>
                <span className="DepositRecordItem-value">
                  {humanTime(record.processedAt())}
                </span>
              </div>
              
              {record.creditedAmount?.() && record.creditedAmount() !== record.amount() && (
                <div className="DepositRecordItem-row">
                  <span className="DepositRecordItem-label">Credited Amount:</span>
                  <span className="DepositRecordItem-value">
                    {record.creditedAmount()} {platform?.symbol?.() || ''}
                  </span>
                </div>
              )}
              
              {record.adminNotes?.() && (
                <div className="DepositRecordItem-row">
                  <span className="DepositRecordItem-label">Admin Notes:</span>
                  <span className="DepositRecordItem-value">{record.adminNotes()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {status === 'pending' && (
          <div className="DepositRecordItem-actions">
            <Button
              className="Button Button--primary DepositRecordItem-approveButton"
              onclick={() => this.handleApprove(record, attrs)}
              loading={isProcessing}
              disabled={isProcessing}
            >
              {app.translator.trans('withdrawal.admin.deposit.records.approve')}
            </Button>
            
            <Button
              className="Button Button--danger DepositRecordItem-rejectButton"
              onclick={() => this.handleReject(record, attrs)}
              loading={isProcessing}
              disabled={isProcessing}
            >
              {app.translator.trans('withdrawal.admin.deposit.records.reject')}
            </Button>
          </div>
        )}

        <div className="DepositRecordItem-adminActions">
          <Button
            className="Button Button--link DepositRecordItem-deleteButton"
            onclick={() => this.handleDelete(record, attrs)}
            disabled={isProcessing}
          >
            {icon('fas fa-trash')}
            {app.translator.trans('withdrawal.admin.deposit.records.delete')}
          </Button>
        </div>
      </div>
    );
  }

  private findPlatform(platforms: any[], platformId: number): any | null {
    return platforms.find(p => {
      const id = typeof p.id === 'function' ? p.id() : p.id;
      return parseInt(id) === platformId;
    }) || null;
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  private renderStatusIcon(status: string): Mithril.Children {
    switch (status) {
      case 'pending':
        return icon('fas fa-clock');
      case 'approved':
        return icon('fas fa-check-circle');
      case 'rejected':
        return icon('fas fa-times-circle');
      default:
        return icon('fas fa-question-circle');
    }
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return app.translator.trans('withdrawal.admin.deposit.records.status.pending').toString();
      case 'approved':
        return app.translator.trans('withdrawal.admin.deposit.records.status.approved').toString();
      case 'rejected':
        return app.translator.trans('withdrawal.admin.deposit.records.status.rejected').toString();
      default:
        return 'Unknown';
    }
  }

  private async handleApprove(record: DepositRecord, attrs: DepositRecordManagementSectionAttrs): Promise<void> {
    const recordId = record.id();
    const defaultAmount = record.amount();

    // Simple approval - could be enhanced with a modal for custom amounts/notes
    const creditedAmount = parseFloat(
      prompt(
        app.translator.trans('withdrawal.admin.deposit.records.approve_prompt', {
          amount: defaultAmount
        }).toString(),
        defaultAmount.toString()
      ) || defaultAmount.toString()
    );

    const notes = prompt(
      app.translator.trans('withdrawal.admin.deposit.records.approve_notes_prompt').toString()
    );

    if (isNaN(creditedAmount) || creditedAmount <= 0) {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.records.invalid_amount')
      );
      return;
    }

    this.state.processingRecords.add(recordId);
    m.redraw();

    try {
      await attrs.onApproveRecord(record, creditedAmount, notes || undefined);
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.records.approve_success')
      );
    } catch (error) {
      console.error('Error approving deposit record:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.records.approve_error')
      );
    } finally {
      this.state.processingRecords.delete(recordId);
      m.redraw();
    }
  }

  private async handleReject(record: DepositRecord, attrs: DepositRecordManagementSectionAttrs): Promise<void> {
    const reason = prompt(
      app.translator.trans('withdrawal.admin.deposit.records.reject_reason_prompt').toString()
    );

    if (!reason || reason.trim() === '') {
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.records.reject_reason_required')
      );
      return;
    }

    const recordId = record.id();
    this.state.processingRecords.add(recordId);
    m.redraw();

    try {
      await attrs.onRejectRecord(record, reason);
      
      app.alerts.show(
        { type: 'success', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.records.reject_success')
      );
    } catch (error) {
      console.error('Error rejecting deposit record:', error);
      app.alerts.show(
        { type: 'error', dismissible: true },
        app.translator.trans('withdrawal.admin.deposit.records.reject_error')
      );
    } finally {
      this.state.processingRecords.delete(recordId);
      m.redraw();
    }
  }

  private handleDelete(record: DepositRecord, attrs: DepositRecordManagementSectionAttrs): void {
    const user = record.user?.();
    const userName = user?.displayName?.() || 'Unknown User';
    const amount = record.amount();

    app.modal.show(ConfirmModal, {
      title: app.translator.trans('withdrawal.admin.deposit.records.delete_confirm_title'),
      message: app.translator.trans('withdrawal.admin.deposit.records.delete_confirm_message', {
        user: userName,
        amount: amount
      }),
      confirmText: app.translator.trans('withdrawal.admin.deposit.records.delete_confirm_button'),
      cancelText: app.translator.trans('withdrawal.admin.deposit.records.delete_cancel_button'),
      dangerous: true,
      icon: 'fas fa-trash',
      onConfirm: async () => {
        const recordId = record.id();
        this.state.processingRecords.add(recordId);
        
        try {
          await attrs.onDeleteRecord(record);
          
          app.alerts.show(
            { type: 'success', dismissible: true },
            app.translator.trans('withdrawal.admin.deposit.records.delete_success')
          );
        } catch (error) {
          console.error('Error deleting deposit record:', error);
          app.alerts.show(
            { type: 'error', dismissible: true },
            app.translator.trans('withdrawal.admin.deposit.records.delete_error')
          );
        } finally {
          this.state.processingRecords.delete(recordId);
          m.redraw();
        }
      },
      onCancel: () => {
        app.modal.close();
      }
    });
  }
}
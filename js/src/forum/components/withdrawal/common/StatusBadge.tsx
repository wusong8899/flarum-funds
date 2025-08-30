import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import type Mithril from 'mithril';
import type { StatusType } from '../types/interfaces';
import { STATUS_CLASS_MAP } from '../utils/constants';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export default class StatusBadge extends Component<StatusBadgeProps> {
  view(): Mithril.Children {
    const { status, className = '' } = this.attrs;
    
    const statusClass = this.getStatusClass(status);
    const statusLabel = this.getStatusLabel(status);

    return (
      <div className={`WithdrawalPage-historyStatus ${statusClass} ${className}`}>
        {statusLabel}
      </div>
    );
  }

  private getStatusClass(status: StatusType): string {
    return STATUS_CLASS_MAP[status] || STATUS_CLASS_MAP.pending;
  }

  private getStatusLabel(status: StatusType): string {
    return app.translator.trans(`withdrawal.forum.status.${status}`).toString();
  }
}
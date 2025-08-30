import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import icon from 'flarum/common/helpers/icon';
import app from 'flarum/common/app';

export interface ConfirmModalAttrs {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  dangerous?: boolean;
  icon?: string;
}

/**
 * 通用确认模态框组件
 * 用于替代重复的删除确认、状态变更确认等模态框
 */
export default class ConfirmModal extends Modal<ConfirmModalAttrs> {
  className() {
    return 'ConfirmModal';
  }

  title() {
    const { title, dangerous = false, icon: modalIcon = dangerous ? 'fas fa-exclamation-triangle' : 'fas fa-question-circle' } = this.attrs;
    
    return (
      <span>
        {modalIcon && (
          <span className={`ConfirmModal-icon ${dangerous ? 'dangerous' : ''}`}>
            {icon(modalIcon)}
          </span>
        )}
        {title}
      </span>
    );
  }

  content() {
    const { 
      message, 
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm, 
      onCancel, 
      dangerous = false
    } = this.attrs;

    return (
      <div className="Modal-body">
        <div className="ConfirmModal-message">
          {message}
        </div>
        
        <div className="Form-group">
          <div className="ButtonGroup">
            <Button
              className="Button"
              onclick={() => {
                onCancel();
                app.modal.close();
              }}
            >
              {cancelText}
            </Button>
            <Button
              className={`Button Button--${dangerous ? 'danger' : 'primary'}`}
              onclick={() => {
                onConfirm();
                app.modal.close();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
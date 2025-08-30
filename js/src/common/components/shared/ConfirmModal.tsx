import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';

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
export default class ConfirmModal extends Component<ConfirmModalAttrs> {
  view(vnode: Mithril.Vnode<ConfirmModalAttrs>) {
    const { 
      title, 
      message, 
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm, 
      onCancel, 
      dangerous = false,
      icon: modalIcon = dangerous ? 'fas fa-exclamation-triangle' : 'fas fa-question-circle'
    } = vnode.attrs;

    return (
      <div className="Modal-dialog ConfirmModal">
        <div className="Modal-content">
          <div className="Modal-header">
            <h3 className="Modal-title">
              {modalIcon && (
                <span className={`ConfirmModal-icon ${dangerous ? 'dangerous' : ''}`}>
                  {icon(modalIcon)}
                </span>
              )}
              {title}
            </h3>
          </div>
          
          <div className="Modal-body">
            <div className="ConfirmModal-message">
              {message}
            </div>
          </div>
          
          <div className="Modal-footer">
            <div className="ButtonGroup">
              <Button
                className="Button"
                onclick={onCancel}
              >
                {cancelText}
              </Button>
              <Button
                className={`Button Button--${dangerous ? 'danger' : 'primary'}`}
                onclick={onConfirm}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
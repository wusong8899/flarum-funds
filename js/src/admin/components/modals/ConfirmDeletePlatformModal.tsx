import app from 'flarum/admin/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';

export interface ConfirmDeletePlatformModalAttrs {
  platformName: string;
  onConfirm: () => void;
}

export default class ConfirmDeletePlatformModal extends Modal<ConfirmDeletePlatformModalAttrs> {
  className() {
    return 'ConfirmDeleteModal Modal--small';
  }

  title() {
    return app.translator.trans('withdrawal.admin.platforms.delete_confirm_title');
  }

  content() {
    return (
      <div className="Modal-body">
        <p>{app.translator.trans('withdrawal.admin.platforms.delete_confirm_message', { name: this.attrs.platformName() })}</p>
        <div className="Form-group">
          <Button 
            className="Button Button--primary" 
            onclick={this.confirm.bind(this)}
          >
            {app.translator.trans('withdrawal.admin.platforms.delete_confirm_button')}
          </Button>
          <Button 
            className="Button" 
            onclick={this.hide.bind(this)}
          >
            {app.translator.trans('withdrawal.admin.platforms.delete_cancel_button')}
          </Button>
        </div>
      </div>
    );
  }

  confirm() {
    this.attrs.onConfirm();
    app.modal.close();
  }
}
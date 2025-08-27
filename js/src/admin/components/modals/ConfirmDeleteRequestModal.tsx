import app from 'flarum/admin/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';

export interface ConfirmDeleteRequestModalAttrs {
  requestInfo: string;
  onConfirm: () => void;
}

export default class ConfirmDeleteRequestModal extends Modal<ConfirmDeleteRequestModalAttrs> {
  className() {
    return 'ConfirmDeleteRequestModal Modal--small';
  }

  title() {
    return app.translator.trans('withdrawal.admin.requests.delete_confirm_title');
  }

  content() {
    return (
      <div className="Modal-body">
        <p>{app.translator.trans('withdrawal.admin.requests.delete_confirm_message', { info: this.attrs.requestInfo })}</p>
        <div className="Form-group">
          <Button 
            className="Button Button--danger" 
            onclick={this.confirm.bind(this)}
          >
            {app.translator.trans('withdrawal.admin.requests.delete_confirm_button')}
          </Button>
          <Button 
            className="Button" 
            onclick={this.hide.bind(this)}
          >
            {app.translator.trans('withdrawal.admin.requests.delete_cancel_button')}
          </Button>
        </div>
      </div>
    );
  }

  confirm() {
    this.attrs.onConfirm();
    this.hide();
  }
}
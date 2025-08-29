import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import type Mithril from 'mithril';

interface MessageInputProps {
  message: string;
  onMessageChange: (message: string) => void;
}

export default class MessageInput extends Component<MessageInputProps> {
  view(): Mithril.Children {
    const { 
      message,
      onMessageChange
    } = this.attrs;

    return (
      <div className="WithdrawalPage-messageSection">
        <div className="WithdrawalPage-formGroup">
          <span className="WithdrawalPage-label">
            {app.translator.trans('withdrawal.forum.form.message')}
          </span>
          <textarea
            className="WithdrawalPage-textarea"
            placeholder={app.translator.trans('withdrawal.forum.form.message_placeholder')}
            value={message}
            rows={3}
            maxlength={500}
            oninput={(e: Event) => onMessageChange((e.target as HTMLTextAreaElement).value)}
          />
          <div className="WithdrawalPage-helperText">
            {app.translator.trans('withdrawal.forum.form.message_helper')} ({message.length}/500)
          </div>
        </div>
      </div>
    );
  }
}
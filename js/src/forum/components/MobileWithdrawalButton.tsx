import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';
import { MobileDetector } from '../utils/MobileDetector';

export default class MobileWithdrawalButton extends Component {
  view(): Mithril.Children {
    // Only show on mobile devices and for logged-in users
    if (!MobileDetector.isMobile() || !app.session.user) {
      return null;
    }

    return (
      <Button
        className="Button Button--icon Navigation-withdrawal hasIcon"
        type="button"
        onclick={() => app.route('withdrawal')}
        title={app.translator.trans('withdrawal.forum.header.withdrawal_button')}
      >
        {icon('fas fa-money-bill-transfer', { className: 'Button-icon' })}
        <span className="Button-label"></span>
      </Button>
    );
  }
}
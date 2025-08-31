import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import withAttr from 'flarum/common/utils/withAttr';
import type Mithril from 'mithril';

export interface GeneralSettingsSectionAttrs {
  onSettingChange: (key: string, value: string) => void;
}

export default class GeneralSettingsSection extends Component<GeneralSettingsSectionAttrs> {
  view(): Mithril.Children {
    return (
      <div className="WithdrawalManagementPage-section">
        <h3>General Settings</h3>
        
        <div className="Form">
          <div className="Form-group">
            <label>{app.translator.trans('funds.admin.settings.money_icon_url')}</label>
            <input
              type="url"
              className="FormControl"
              placeholder="https://i.mji.rip/2025/08/28/cd18932c68e9bbee9502b1fb6317cba9.png"
              value={app.forum.attribute('wusong8899-funds.moneyIconUrl') || ''}
              oninput={withAttr('value', (value: string) => 
                this.attrs.onSettingChange('wusong8899-funds.moneyIconUrl', value)
              )}
            />
            <small className="helpText">{app.translator.trans('funds.admin.settings.money_icon_url_help')}</small>
          </div>
        </div>
      </div>
    );
  }
}
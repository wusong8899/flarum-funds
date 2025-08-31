import app from 'flarum/admin/app';
import type Mithril from 'mithril';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import AddDepositPlatformForm from '../forms/AddDepositPlatformForm';
import GenericPlatformListItem from '../shared/GenericPlatformListItem';
import type { GenericPlatform } from '../shared/GenericManagementPage';

interface DepositPlatformManagementSectionAttrs {
  platforms: GenericPlatform[];
  submittingPlatform: boolean;
  onAddPlatform: (formData: any) => Promise<void>;
  onTogglePlatformStatus: (platform: GenericPlatform) => Promise<void>;
  onDeletePlatform: (platform: GenericPlatform) => Promise<void>;
}

export default class DepositPlatformManagementSection extends Component<DepositPlatformManagementSectionAttrs> {
  view(vnode: Mithril.Vnode<DepositPlatformManagementSectionAttrs>): Mithril.Children {
    const { platforms, submittingPlatform, onAddPlatform, onTogglePlatformStatus, onDeletePlatform } = vnode.attrs;

    return (
      <div className="DepositPlatformManagementSection">
        <div className="Section-header">
          <h3>{app.translator.trans('withdrawal.admin.deposit.platforms.title')}</h3>
        </div>

        <div className="DepositPlatformManagementSection-layout">
          {/* Always visible form */}
          <div className="DepositPlatformManagementSection-form">
            <div className="DepositPlatformManagementSection-formHeader">
              <h4>Add New Platform</h4>
              <Button
                className="Button Button--primary DepositPlatformManagementSection-addButton"
                icon="fas fa-plus"
                type="submit"
                form="deposit-platform-form"
                loading={submittingPlatform}
                disabled={submittingPlatform}
              >
                {app.translator.trans('withdrawal.admin.deposit.platforms.add_button')}
              </Button>
            </div>
            
            <AddDepositPlatformForm
              onSubmit={onAddPlatform}
              onCancel={() => {}} // Not needed since form is always visible
              submitting={submittingPlatform}
            />
          </div>

          {/* Existing platforms list */}
          <div className="DepositPlatformManagementSection-list">
            <h4>Existing Platforms</h4>
            <div className="Section-content">
              {platforms.length === 0 ? (
                <div className="helpText">
                  {app.translator.trans('withdrawal.admin.deposit.platforms.empty')}
                </div>
              ) : (
                <div className="PlatformList">
                  {platforms.map((platform) => (
                    <GenericPlatformListItem
                      key={typeof platform.id === 'function' ? platform.id() : platform.id}
                      platform={platform}
                      type="deposit"
                      onToggleStatus={() => onTogglePlatformStatus(platform)}
                      onDelete={() => onDeletePlatform(platform)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
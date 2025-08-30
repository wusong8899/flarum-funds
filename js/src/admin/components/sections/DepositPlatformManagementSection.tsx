import app from 'flarum/admin/app';
import m from 'mithril';
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
  private showAddForm = false;

  view(vnode: Mithril.Vnode<DepositPlatformManagementSectionAttrs>): Mithril.Children {
    const { platforms, submittingPlatform, onAddPlatform, onTogglePlatformStatus, onDeletePlatform } = vnode.attrs;

    return (
      <div className="DepositPlatformManagementSection">
        <div className="Section-header">
          <h3>{app.translator.trans('withdrawal.admin.deposit.platforms.title')}</h3>
          <div className="Section-headerControls">
            <Button
              className="Button Button--primary"
              icon="fas fa-plus"
              onclick={() => {
                this.showAddForm = !this.showAddForm;
                m.redraw();
              }}
            >
              {app.translator.trans('withdrawal.admin.deposit.platforms.add_button')}
            </Button>
          </div>
        </div>

        {this.showAddForm && (
          <div className="Section-content">
            <AddDepositPlatformForm
              onSubmit={async (formData: any) => {
                await onAddPlatform(formData);
                this.showAddForm = false;
                m.redraw();
              }}
              onCancel={() => {
                this.showAddForm = false;
                m.redraw();
              }}
              submitting={submittingPlatform}
            />
          </div>
        )}

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
                  onToggleStatus={() => onTogglePlatformStatus(platform)}
                  onDelete={() => onDeletePlatform(platform)}
                  typePrefix="deposit"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
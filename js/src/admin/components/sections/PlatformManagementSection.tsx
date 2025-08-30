import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import type Mithril from 'mithril';
import { WithdrawalPlatform, PlatformFormData } from '../types/AdminTypes';
import AddPlatformForm from '../forms/AddPlatformForm';
import GenericPlatformListItem from '../shared/GenericPlatformListItem';

export interface PlatformManagementSectionAttrs {
  platforms: WithdrawalPlatform[];
  submittingPlatform: boolean;
  onAddPlatform: (formData: PlatformFormData) => Promise<void>;
  onTogglePlatformStatus: (platform: WithdrawalPlatform) => Promise<void>;
  onDeletePlatform: (platform: WithdrawalPlatform) => void;
}

export default class PlatformManagementSection extends Component<PlatformManagementSectionAttrs> {
  view(): Mithril.Children {
    const { platforms, submittingPlatform, onAddPlatform, onTogglePlatformStatus, onDeletePlatform } = this.attrs;

    return (
      <div className="WithdrawalManagementPage-section">
        <h3>{app.translator.trans('withdrawal.admin.platforms.title')}</h3>
        
        <AddPlatformForm 
          onSubmit={onAddPlatform}
          submitting={submittingPlatform}
        />

        <div className="WithdrawalManagementPage-platformList">
          {platforms.length === 0 ? (
            <p>{app.translator.trans('withdrawal.admin.platforms.empty')}</p>
          ) : (
            platforms.map((platform) => (
              <GenericPlatformListItem
                key={typeof platform.id === 'function' ? platform.id() : platform.id}
                platform={platform}
                type="withdrawal"
                style="card"
                onToggleStatus={onTogglePlatformStatus}
                onDelete={onDeletePlatform}
              />
            ))
          )}
        </div>
      </div>
    );
  }
}
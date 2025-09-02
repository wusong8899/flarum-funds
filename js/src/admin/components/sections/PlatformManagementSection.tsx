import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import type Mithril from 'mithril';
import { WithdrawalPlatform, PlatformFormData } from '../types/AdminTypes';
import AddPlatformForm from '../forms/AddPlatformForm';
import GenericPlatformListItem from '../shared/GenericPlatformListItem';
import EditPlatformModal from '../modals/EditPlatformModal';
import Stream from 'flarum/common/utils/Stream';

export interface PlatformManagementSectionAttrs {
  platforms: WithdrawalPlatform[];
  submittingPlatform: boolean;
  onAddPlatform: (formData: PlatformFormData) => Promise<void>;
  onTogglePlatformStatus: (platform: WithdrawalPlatform) => Promise<void>;
  onDeletePlatform: (platform: WithdrawalPlatform) => void;
  onEditPlatform: (id: number, formData: PlatformFormData) => Promise<void>;
}

export default class PlatformManagementSection extends Component<PlatformManagementSectionAttrs> {
  private editingPlatform: WithdrawalPlatform | null = null;

  view(): Mithril.Children {
    const { platforms, submittingPlatform, onAddPlatform, onTogglePlatformStatus, onDeletePlatform, onEditPlatform } = this.attrs;

    return (
      <div className="WithdrawalManagementPage-section">
        <h3>{app.translator.trans('funds.admin.platforms.title')}</h3>
        
        <AddPlatformForm 
          onSubmit={onAddPlatform}
          submitting={submittingPlatform}
        />

        <div className="PlatformList">
          {platforms.length === 0 ? (
            <p>{app.translator.trans('funds.admin.platforms.empty')}</p>
          ) : (
            platforms
              .filter((platform) => platform !== null && platform !== undefined)
              .map((platform) => (
                <GenericPlatformListItem
                  key={platform.id()}
                  platform={platform}
                  type="withdrawal"
                  style="card"
                  onToggleStatus={onTogglePlatformStatus}
                  onDelete={onDeletePlatform}
                  onEdit={this.handleEdit.bind(this)}
                />
              ))
          )}
        </div>
      </div>
    );
  }

  private handleEdit(platform: WithdrawalPlatform): void {
    this.editingPlatform = platform;
    app.modal.show(EditPlatformModal, {
      platform: platform,
      onEdit: this.handleEditSubmit.bind(this)
    });
  }

  private async handleEditSubmit(id: number, formData: PlatformFormData): Promise<void> {
    try {
      await this.attrs.onEditPlatform(id, formData);
      this.editingPlatform = null;
    } catch (error) {
      // Error handling is done in modal
      throw error;
    }
  }
}
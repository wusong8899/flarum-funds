import app from 'flarum/admin/app';
import type Mithril from 'mithril';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import AddDepositPlatformForm, { DepositPlatformFormData } from '../forms/AddDepositPlatformForm';
import GenericPlatformListItem from '../shared/GenericPlatformListItem';
import EditDepositPlatformModal from '../modals/EditDepositPlatformModal';
import type { GenericPlatform } from '../shared/GenericManagementPage';
import { DepositPlatform } from '../types/AdminTypes';

interface DepositPlatformManagementSectionAttrs {
  platforms: GenericPlatform[];
  submittingPlatform: boolean;
  onAddPlatform: (formData: DepositPlatformFormData) => Promise<void>;
  onTogglePlatformStatus: (platform: GenericPlatform) => Promise<void>;
  onDeletePlatform: (platform: GenericPlatform) => Promise<void>;
  onEditPlatform: (id: number, formData: DepositPlatformFormData) => Promise<void>;
}

export default class DepositPlatformManagementSection extends Component<DepositPlatformManagementSectionAttrs> {
  private editingPlatform: DepositPlatform | null = null;

  view(vnode: Mithril.Vnode<DepositPlatformManagementSectionAttrs>): Mithril.Children {
    const { platforms, submittingPlatform, onAddPlatform, onTogglePlatformStatus, onDeletePlatform, onEditPlatform } = vnode.attrs;

    return (
      <div className="DepositPlatformManagementSection">
        <div className="Section-header">
          <h3>{app.translator.trans('funds.admin.deposit.platforms.title')}</h3>
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
                {app.translator.trans('funds.admin.deposit.platforms.add_button')}
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
                  {app.translator.trans('funds.admin.deposit.platforms.empty')}
                </div>
              ) : (
                <div className="PlatformList">
                  {platforms
                    .filter((platform) => platform !== null && platform !== undefined)
                    .map((platform) => (
                      <GenericPlatformListItem
                        key={typeof platform.id === 'function' ? platform.id() : platform.id}
                        platform={platform}
                        type="deposit"
                        onToggleStatus={() => onTogglePlatformStatus(platform)}
                        onDelete={() => onDeletePlatform(platform)}
                        onEdit={this.handleEdit.bind(this)}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {this.editingPlatform && (
          <EditDepositPlatformModal
            platform={this.editingPlatform}
            onEdit={this.handleEditSubmit.bind(this)}
            onhide={() => {
              this.editingPlatform = null;
            }}
          />
        )}
      </div>
    );
  }

  private handleEdit(platform: GenericPlatform): void {
    // Convert GenericPlatform to DepositPlatform for modal
    const depositPlatform: DepositPlatform = {
      id: typeof platform.id === 'function' ? platform.id() : platform.id,
      name: typeof platform.name === 'function' ? platform.name() : platform.name,
      symbol: typeof platform.symbol === 'function' ? platform.symbol() : platform.symbol,
      network: typeof platform.network === 'function' ? platform.network() : platform.network,
      displayName: typeof platform.displayName === 'function' ? platform.displayName() : platform.displayName,
      minAmount: typeof platform.minAmount === 'function' ? platform.minAmount() : platform.minAmount,
      maxAmount: typeof platform.maxAmount === 'function' ? platform.maxAmount() : platform.maxAmount,
      fee: typeof platform.fee === 'function' ? platform.fee() : platform.fee || 0,
      address: typeof platform.address === 'function' ? platform.address() : platform.address,
      qrCodeImageUrl: typeof platform.qrCodeImageUrl === 'function' ? platform.qrCodeImageUrl() : platform.qrCodeImageUrl,
      platformSpecificIconUrl: typeof platform.platformIconUrl === 'function' ? platform.platformIconUrl() : platform.platformIconUrl,
      platformSpecificIconClass: typeof platform.platformIconClass === 'function' ? platform.platformIconClass() : platform.platformIconClass,
      warningText: '',
      isActive: typeof platform.isActive === 'function' ? platform.isActive() : platform.isActive || false,
      createdAt: typeof platform.createdAt === 'function' ? platform.createdAt() : new Date(),
      updatedAt: new Date()
    };
    
    this.editingPlatform = depositPlatform;
    app.modal.show(EditDepositPlatformModal, {
      platform: depositPlatform,
      onEdit: this.handleEditSubmit.bind(this)
    });
  }

  private async handleEditSubmit(id: number, formData: DepositPlatformFormData): Promise<void> {
    try {
      await this.attrs.onEditPlatform(id, formData);
      this.editingPlatform = null;
    } catch (error) {
      // Error handling is done in modal
      throw error;
    }
  }
}
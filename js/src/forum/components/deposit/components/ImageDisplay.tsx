import Component from 'flarum/common/Component';
import DepositPlatform from '../../../../common/models/DepositPlatform';
import type Mithril from 'mithril';

export interface ImageDisplayAttrs {
  platform: DepositPlatform | null;
  loading?: boolean;
  size?: number;
}

export default class ImageDisplay extends Component<ImageDisplayAttrs> {
  view(vnode: Mithril.Vnode<ImageDisplayAttrs>) {
    const { platform, loading } = vnode.attrs;

    return (
      <div className="ImageDisplay">
        {loading ? (
          <div className="ImageDisplay-loading">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        ) : platform && platform.qrCodeImageUrl() ? (
          <img 
            src={platform.qrCodeImageUrl()} 
            alt={`${platform.name()} Image`}
            className="ImageDisplay-image"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
          />
        ) : (
          <div className="ImageDisplay-placeholder">
            <i className="fas fa-image"></i>
            <div>No Image</div>
          </div>
        )}
        <div className="ImageDisplay-error" style={{ display: 'none' }}>
          <i className="fas fa-exclamation-triangle"></i>
          <div>Image Load Failed</div>
        </div>
      </div>
    );
  }
}
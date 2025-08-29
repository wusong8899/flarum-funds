import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';

export interface AddressDisplayAttrs {
  address: string;
  loading: boolean;
  onCopy: () => void;
}

export default class AddressDisplay extends Component<AddressDisplayAttrs> {
  view(vnode: Mithril.Vnode<AddressDisplayAttrs>) {
    const { address, loading, onCopy } = vnode.attrs;

    return (
      <div className="AddressDisplay">
        {loading ? (
          <div className="AddressDisplay-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Generating address...</span>
          </div>
        ) : address ? (
          <div className="AddressDisplay-content">
            <div className="AddressDisplay-address" title={address}>
              {address}
            </div>
            <div className="AddressDisplay-actions">
              <button
                className="AddressDisplay-copyBtn"
                onclick={onCopy}
                title="Copy address"
              >
                {icon('fas fa-copy')}
              </button>
            </div>
          </div>
        ) : (
          <div className="AddressDisplay-placeholder">
            <span>No address available</span>
          </div>
        )}
      </div>
    );
  }
}
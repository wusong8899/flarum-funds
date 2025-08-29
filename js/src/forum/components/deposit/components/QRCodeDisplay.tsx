import Component from 'flarum/common/Component';
import m from 'mithril';
import type Mithril from 'mithril';

// Note: You'll need to install qrcode library: npm install qrcode @types/qrcode
declare const QRCode: any;

export interface QRCodeDisplayAttrs {
  data: string;
  loading: boolean;
  size?: number;
}

export default class QRCodeDisplay extends Component<QRCodeDisplayAttrs> {
  private qrElement: HTMLDivElement | null = null;

  view(vnode: Mithril.Vnode<QRCodeDisplayAttrs>) {
    const { loading, size = 160 } = vnode.attrs;

    return (
      <div className="QRCodeDisplay" style={{ width: `${size}px`, height: `${size}px` }}>
        {loading ? (
          <div className="QRCodeDisplay-loading">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        ) : (
          <div className="QRCodeDisplay-qr" ref={(el) => { this.qrElement = el as HTMLDivElement; }}></div>
        )}
      </div>
    );
  }

  oncreate(vnode: Mithril.VnodeDOM<QRCodeDisplayAttrs>) {
    super.oncreate(vnode);
    this.generateQR(vnode.attrs);
  }

  onupdate(vnode: Mithril.VnodeDOM<QRCodeDisplayAttrs>) {
    super.onupdate(vnode);
    this.generateQR(vnode.attrs);
  }

  private generateQR(attrs: QRCodeDisplayAttrs): void {
    if (!this.qrElement || attrs.loading || !attrs.data) {
      return;
    }

    // Clear previous QR code
    this.qrElement.innerHTML = '';

    try {
      // Check if QRCode library is available
      if (typeof QRCode !== 'undefined') {
        // Using qrcode.js library
        new QRCode(this.qrElement, {
          text: attrs.data,
          width: attrs.size || 160,
          height: attrs.size || 160,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      } else {
        // Fallback: Use a QR code service
        this.generateQRWithService(attrs);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.showQRError();
    }
  }

  private generateQRWithService(attrs: QRCodeDisplayAttrs): void {
    if (!this.qrElement) return;

    const size = attrs.size || 160;
    const qrData = encodeURIComponent(attrs.data);
    
    // Using qr-server.com as fallback service
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrData}`;
    img.alt = 'QR Code';
    img.style.width = '100%';
    img.style.height = '100%';
    img.onerror = () => this.showQRError();
    
    this.qrElement.appendChild(img);
  }

  private showQRError(): void {
    if (!this.qrElement) return;

    this.qrElement.innerHTML = `
      <div class="QRCodeDisplay-error">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Unable to generate QR code</span>
      </div>
    `;
  }
}
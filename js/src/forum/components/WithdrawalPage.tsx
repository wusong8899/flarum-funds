import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Select from 'flarum/common/components/Select';
import Stream from 'flarum/common/utils/Stream';
import dayjs from 'flarum/common/utils/dayjs';
import type Mithril from 'mithril';

interface WithdrawalPlatform {
  id: number;
  attributes: {
    name: string;
  };
}

interface WithdrawalRequest {
  id: number;
  attributes: {
    amount: number;
    accountDetails: string;
    status: string;
    createdAt: string;
  };
  relationships: {
    platform: {
      data: { id: number };
    };
  };
}

export default class WithdrawalPage extends Page {
  private platforms: WithdrawalPlatform[] = [];
  private requests: WithdrawalRequest[] = [];
  private loading = true;
  private submitting = false;

  private amount = Stream('');
  private selectedPlatform = Stream('');
  private accountDetails = Stream('');

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);

    app.setTitle(app.translator.trans('withdrawal.forum.page.title'));

    this.loadData();
  }

  view() {
    if (this.loading) {
      return (
        <div className="WithdrawalPage">
          <div className="container">
            <LoadingIndicator />
          </div>
        </div>
      );
    }

    const minAmount = app.forum.attribute('withdrawal.minAmount') || 0;
    const maxAmount = app.forum.attribute('withdrawal.maxAmount') || 10000;
    const fee = app.forum.attribute('withdrawal.fee') || 0;

    return (
      <div className="WithdrawalPage">
        <div className="container">
          <div className="WithdrawalPage-header">
            <h1>{app.translator.trans('withdrawal.forum.page.title')}</h1>
            <p>{app.translator.trans('withdrawal.forum.page.description')}</p>
          </div>

          <div className="WithdrawalPage-content">
            <div className="WithdrawalPage-form">
              <h3>{app.translator.trans('withdrawal.forum.form.title')}</h3>
              
              <div className="WithdrawalPage-formGroup">
                <label>{app.translator.trans('withdrawal.forum.form.platform')}</label>
                <Select
                  options={this.getPlatformOptions()}
                  value={this.selectedPlatform()}
                  onchange={this.selectedPlatform}
                />
              </div>

              <div className="WithdrawalPage-formGroup">
                <label>{app.translator.trans('withdrawal.forum.form.amount')}</label>
                <input
                  type="number"
                  className="FormControl"
                  placeholder={app.translator.trans('withdrawal.forum.form.amount_placeholder', { min: minAmount, max: maxAmount })}
                  value={this.amount()}
                  oninput={(e: Event) => this.amount((e.target as HTMLInputElement).value)}
                  min={minAmount}
                  max={maxAmount}
                  step="0.01"
                />
                <small className="helpText">
                  {app.translator.trans('withdrawal.forum.form.amount_help', { min: minAmount, max: maxAmount, fee: fee })}
                </small>
              </div>

              <div className="WithdrawalPage-formGroup">
                <label>{app.translator.trans('withdrawal.forum.form.account_details')}</label>
                <textarea
                  className="FormControl"
                  placeholder={app.translator.trans('withdrawal.forum.form.account_details_placeholder')}
                  value={this.accountDetails()}
                  oninput={(e: Event) => this.accountDetails((e.target as HTMLTextAreaElement).value)}
                  rows={3}
                />
              </div>

              <div className="WithdrawalPage-formGroup">
                <Button
                  className="Button Button--primary"
                  loading={this.submitting}
                  disabled={!this.canSubmit()}
                  onclick={this.submit.bind(this)}
                >
                  {app.translator.trans('withdrawal.forum.form.submit')}
                </Button>
              </div>
            </div>

            <div className="WithdrawalPage-history">
              <h3>{app.translator.trans('withdrawal.forum.history.title')}</h3>
              {this.requests.length === 0 ? (
                <p>{app.translator.trans('withdrawal.forum.history.empty')}</p>
              ) : (
                <div className="WithdrawalPage-historyList">
                  {this.requests.map((request) => this.renderRequest(request))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderRequest(request: WithdrawalRequest): Mithril.Children {
    const platform = this.platforms.find(p => p.id == request.relationships.platform.data.id);
    const statusClass = `status-${request.attributes.status}`;

    return (
      <div key={request.id} className={`WithdrawalRequest ${statusClass}`}>
        <div className="WithdrawalRequest-info">
          <span className="WithdrawalRequest-amount">${request.attributes.amount}</span>
          <span className="WithdrawalRequest-platform">{platform?.attributes.name}</span>
          <span className="WithdrawalRequest-date">
            {dayjs(request.attributes.createdAt).format('YYYY-MM-DD HH:mm')}
          </span>
        </div>
        <div className="WithdrawalRequest-status">
          <span className={`Badge Badge--${request.attributes.status}`}>
            {app.translator.trans(`withdrawal.forum.status.${request.attributes.status}`)}
          </span>
        </div>
      </div>
    );
  }

  private getPlatformOptions(): Record<string, string> {
    const options: Record<string, string> = {
      '': app.translator.trans('withdrawal.forum.form.select_platform')
    };

    this.platforms.forEach(platform => {
      options[platform.id.toString()] = platform.attributes.name;
    });

    return options;
  }

  private canSubmit(): boolean {
    return !!(
      this.selectedPlatform() &&
      this.amount() &&
      this.accountDetails() &&
      !this.submitting
    );
  }

  private async submit(): Promise<void> {
    if (!this.canSubmit()) return;

    this.submitting = true;

    try {
      const data = {
        type: 'withdrawal-requests',
        attributes: {
          platformId: parseInt(this.selectedPlatform()),
          amount: parseFloat(this.amount()),
          accountDetails: this.accountDetails()
        }
      };

      await app.store.createRecord('withdrawal-requests').save(data);

      app.alerts.show({
        type: 'success',
        message: app.translator.trans('withdrawal.forum.form.success')
      });

      this.amount('');
      this.selectedPlatform('');
      this.accountDetails('');

      this.loadRequests();
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      app.alerts.show({
        type: 'error',
        message: app.translator.trans('withdrawal.forum.form.error')
      });
    } finally {
      this.submitting = false;
      m.redraw();
    }
  }

  private async loadData(): Promise<void> {
    try {
      await Promise.all([
        this.loadPlatforms(),
        this.loadRequests()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  private async loadPlatforms(): Promise<void> {
    const response = await app.store.find('withdrawal-platforms');
    this.platforms = Array.isArray(response) ? response : [response];
  }

  private async loadRequests(): Promise<void> {
    const response = await app.store.find('withdrawal-requests');
    this.requests = Array.isArray(response) ? response : [response];
  }
}
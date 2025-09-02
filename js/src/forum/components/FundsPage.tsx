import app from "flarum/forum/app";
import Page from "flarum/common/components/Page";
import Button from "flarum/common/components/Button";
import LoadingIndicator from "flarum/common/components/LoadingIndicator";
import Stream from "flarum/common/utils/Stream";
import icon from "flarum/common/helpers/icon";
import m from "mithril";
import type Mithril from "mithril";

// Withdrawal imports
import type { WithdrawalFormData } from "./withdrawal/types/interfaces";
import WithdrawalPlatform from "../../common/models/WithdrawalPlatform";
import WithdrawalForm from "./withdrawal/forms/WithdrawalForm";
import TransactionHistory from "./shared/TransactionHistory";

// Deposit imports
import type { DepositFormData } from "./deposit/forms/DepositForm";
import DepositForm from "./deposit/forms/DepositForm";
import DepositRecord from "../../common/models/DepositRecord";
import depositService from "../../common/services/DepositService";

// Services
import { withdrawalService, platformService } from "../../common/services";
import { ServiceError } from "../../common/types/services";

// Utilities
import { getAttr, getIdString } from "./withdrawal/utils/modelHelpers";
import {
  extractErrorMessage,
  type FlarumApiError,
} from "../../common/types/api";

type TabType = "withdrawal" | "deposit" | "history";

interface FundsPageState {
  // Withdrawal state
  withdrawalPlatforms: WithdrawalPlatform[];
  withdrawalRequests: any[];
  userBalance: number;
  loadingBalance: boolean;
  submitting: boolean;

  // Deposit state - 存款状态
  depositPlatforms: any[]; // DepositPlatform[]
  depositRecords: DepositRecord[];
  submittingDeposit: boolean;

  // Shared state
  loading: boolean;
  activeTab: Stream<TabType>;
}

export default class FundsPage extends Page<any, FundsPageState> {
  state: FundsPageState = {
    withdrawalPlatforms: [],
    withdrawalRequests: [],
    userBalance: 0,
    loadingBalance: true,
    submitting: false,
    depositPlatforms: [],
    depositRecords: [],
    submittingDeposit: false,
    loading: true,
    activeTab: Stream("withdrawal"),
  };

  // Withdrawal form data
  private withdrawalFormData: WithdrawalFormData = {
    amount: Stream(""),
    selectedPlatform: Stream<WithdrawalPlatform | null>(null),
    accountDetails: Stream(""),
    message: Stream(""),
  };

  // 简化的存款表单数据不需要复杂的状态管理

  oninit(vnode: Mithril.VnodeDOM) {
    super.oninit(vnode);

    // Parse URL to determine initial tab and sub-tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");

    // Handle URL parameters to set appropriate tab
    if (tabParam) {
      // Handle legacy sub-tab URLs by redirecting to main tabs
      if (tabParam === "withdrawal-history" || tabParam === "deposit-history") {
        this.state.activeTab("history");
      } else if (this.isValidTab(tabParam)) {
        this.state.activeTab(tabParam as TabType);
      }
    }

    // Set page title based on active tab
    this.updatePageTitle();

    // Load data for both systems
    this.loadAllData();
  }

  private isValidTab(tab: string): boolean {
    return ["withdrawal", "deposit", "history"].includes(tab);
  }

  private updateUrl(): void {
    const currentTab = this.state.activeTab();
    const params = new URLSearchParams();

    params.set("tab", currentTab);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }

  private updatePageTitle(): void {
    const tab = this.state.activeTab();
    let titleKey = "funds.forum.page.title"; // default

    switch (tab) {
      case "withdrawal":
        titleKey = "funds.forum.page.title";
        break;
      case "deposit":
        titleKey = "funds.forum.deposit.page.title";
        break;
      case "history":
        titleKey = "funds.forum.history.page.title";
        break;
    }

    // Fixed: Convert NestedStringArray to string using toString()
    const title = app.translator.trans(titleKey);
    app.setTitle(typeof title === "string" ? title : title.toString());
  }

  view() {
    if (this.state.loading) {
      return (
        <div className="FundsPage">
          <div className="FundsPage-loading">
            <LoadingIndicator />
          </div>
        </div>
      );
    }

    return (
      <div className="FundsPage">
        <div className="FundsPage-modal">
          {this.renderHeader()}
          <div className="FundsPage-content">{this.renderActiveTab()}</div>
        </div>
      </div>
    );
  }

  private renderHeader(): Mithril.Children {
    const activeTab = this.state.activeTab();

    return (
      <div className="FundsPage-header">
        <div className="FundsPage-tabs">
          <div
            className={`FundsPage-tab ${
              activeTab === "withdrawal" ? "active" : ""
            }`}
            onclick={() => this.handleTabChange("withdrawal")}
          >
            {app.translator.trans("funds.forum.tabs.funds")}
          </div>
          <div
            className={`FundsPage-tab ${
              activeTab === "deposit" ? "active" : ""
            }`}
            onclick={() => this.handleTabChange("deposit")}
          >
            {app.translator.trans("funds.forum.deposit.tabs.deposit")}
          </div>
          <div
            className={`FundsPage-tab ${
              activeTab === "history" ? "active" : ""
            }`}
            onclick={() => this.handleTabChange("history")}
          >
            {app.translator.trans("funds.forum.tabs.history")}
          </div>
        </div>
        <Button
          className="FundsPage-close"
          icon="fas fa-times"
          onclick={() => app.history.back()}
        />
      </div>
    );
  }

  private renderActiveTab(): Mithril.Children {
    const activeTab = this.state.activeTab();

    switch (activeTab) {
      case "withdrawal":
        return this.renderWithdrawalTab();
      case "deposit":
        return this.renderDepositTab();
      case "history":
        return this.renderHistoryTab();
      default:
        return this.renderWithdrawalTab();
    }
  }

  private renderWithdrawalTab(): Mithril.Children {
    return this.renderWithdrawalForm();
  }

  private renderWithdrawalForm(): Mithril.Children {
    const validPlatforms = (this.state.withdrawalPlatforms || []).filter(
      (platform) => !!platform
    );

    if (validPlatforms.length === 0) {
      return (
        <div className="FundsPage-withdrawalContent">
          <div className="FundsPage-emptyState">
            <div className="FundsPage-emptyIcon">
              {icon("fas fa-coins")}
            </div>
            <h3 className="FundsPage-emptyTitle">
              {app.translator.trans("funds.forum.no_platforms")}
            </h3>
            <p className="FundsPage-emptyDescription">
              {app.translator.trans("funds.forum.no_platforms_description")}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="FundsPage-withdrawalContent">
        <WithdrawalForm
          platforms={this.state.withdrawalPlatforms}
          formData={this.getWithdrawalFormDataForComponent()}
          loadingBalance={this.state.loadingBalance}
          submitting={this.state.submitting}
          onFormDataChange={this.handleWithdrawalFormDataChange.bind(this)}
          onFillAllAmount={this.handleFillAllAmount.bind(this)}
          onSubmit={this.handleWithdrawalSubmit.bind(this)}
        />
      </div>
    );
  }

  private renderWithdrawalHistory(): Mithril.Children {
    return (
      <div className="FundsPage-withdrawalContent">
        <TransactionHistory
          transactions={this.state.withdrawalRequests}
          platforms={this.state.withdrawalPlatforms}
          loading={false}
          type="withdrawal"
        />
      </div>
    );
  }

  private renderDepositTab(): Mithril.Children {
    return this.renderDepositForm();
  }

  private renderDepositForm(): Mithril.Children {
    return (
      <div className="FundsPage-depositContent">
        <DepositForm
          platforms={this.state.depositPlatforms}
          onSubmit={this.handleDepositSubmit.bind(this)}
          onCancel={this.handleCancelDepositForm.bind(this)}
          submitting={this.state.submittingDeposit}
        />
      </div>
    );
  }

  private renderDepositHistory(): Mithril.Children {
    return (
      <div className="FundsPage-depositContent">
        <TransactionHistory
          transactions={this.state.depositRecords}
          platforms={this.state.depositPlatforms}
          loading={false}
          type="deposit"
        />
      </div>
    );
  }

  private renderHistoryTab(): Mithril.Children {
    const withdrawalRequests = this.state.withdrawalRequests || [];
    const depositRecords = this.state.depositRecords || [];
    const hasWithdrawals = withdrawalRequests.length > 0;
    const hasDeposits = depositRecords.length > 0;

    if (!hasWithdrawals && !hasDeposits) {
      return (
        <div className="FundsPage-historyContent">
          <div className="FundsPage-emptyState">
            <div className="FundsPage-emptyIcon">{icon("fas fa-history")}</div>
            <h3 className="FundsPage-emptyTitle">
              {app.translator.trans("funds.forum.history.empty.title")}
            </h3>
            <p className="FundsPage-emptyDescription">
              {app.translator.trans("funds.forum.history.empty.description")}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="FundsPage-historyContent">
        {hasWithdrawals && (
          <div className="FundsPage-historySection">
            <TransactionHistory
              transactions={withdrawalRequests}
              platforms={this.state.withdrawalPlatforms}
              loading={false}
              type="withdrawal"
            />
          </div>
        )}

        {hasDeposits && (
          <div className="FundsPage-historySection">
            <TransactionHistory
              transactions={depositRecords}
              platforms={this.state.depositPlatforms}
              loading={false}
              type="deposit"
            />
          </div>
        )}
      </div>
    );
  }

  private handleTabChange(tab: TabType): void {
    this.state.activeTab(tab);
    this.updatePageTitle();
    this.updateUrl();
  }

  private getWithdrawalFormDataForComponent() {
    const selectedPlatform = this.withdrawalFormData.selectedPlatform();
    return {
      selectedPlatform: selectedPlatform,
      amount: this.withdrawalFormData.amount(),
      accountDetails: this.withdrawalFormData.accountDetails(),
      message: this.withdrawalFormData.message(),
    };
  }

  private handleWithdrawalFormDataChange(
    data: Partial<WithdrawalFormData>
  ): void {
    if (data.selectedPlatform !== undefined) {
      this.withdrawalFormData.selectedPlatform(data.selectedPlatform);
    }
    if (data.amount !== undefined) {
      this.withdrawalFormData.amount(data.amount);
    }
    if (data.accountDetails !== undefined) {
      this.withdrawalFormData.accountDetails(data.accountDetails);
    }
    if (data.message !== undefined) {
      this.withdrawalFormData.message(data.message);
    }
  }

  private async handleFillAllAmount(): Promise<void> {
    const selectedPlatform = this.withdrawalFormData.selectedPlatform();
    if (!selectedPlatform) return;

    if (this.state.loadingBalance) return;

    try {
      await this.loadUserBalance(true);

      const fee = getAttr(selectedPlatform, "fee") || 0;
      const maxAmount = getAttr(selectedPlatform, "maxAmount") || Infinity;
      let availableAmount = this.state.userBalance - fee;

      if (maxAmount < Infinity && availableAmount > maxAmount) {
        availableAmount = maxAmount;
      }

      if (availableAmount > 0) {
        this.withdrawalFormData.amount(availableAmount.toString());
      } else {
        app.alerts.show(
          { type: "warning", dismissible: true },
          app.translator.trans("funds.forum.insufficient_balance")
        );
      }
    } catch (error) {
      console.error("Error refreshing balance:", error);
      app.alerts.show(
        { type: "error", dismissible: true },
        app.translator.trans("funds.forum.balance_refresh_error")
      );
    }
  }

  private async handleWithdrawalSubmit(): Promise<void> {
    if (this.state.submitting) return;

    const selectedPlatform = this.withdrawalFormData.selectedPlatform();
    const amount = this.withdrawalFormData.amount();
    const accountDetails = this.withdrawalFormData.accountDetails();

    if (!selectedPlatform || !amount || !accountDetails) {
      return;
    }

    // Basic validation
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      app.alerts.show(
        { type: "warning", dismissible: true },
        app.translator.trans("funds.forum.invalid_amount")
      );
      return;
    }

    this.state.submitting = true;

    try {
      await withdrawalService.submitRequest({
        platformId: parseInt(getIdString(selectedPlatform), 10),
        amount: amountNum,
        accountDetails,
        message: this.withdrawalFormData.message(),
      });

      // Clear form
      this.withdrawalFormData.amount("");
      this.withdrawalFormData.accountDetails("");
      this.withdrawalFormData.message("");
      this.withdrawalFormData.selectedPlatform(null);

      // Refresh data
      await Promise.all([
        this.loadUserBalance(true),
        this.loadWithdrawalRequests(),
      ]);

      app.alerts.show(
        { type: "success", dismissible: true },
        app.translator.trans("funds.forum.submit_success")
      );
    } catch (error: unknown) {
      console.error("Withdrawal request failed:", error);

      let errorMessage = app.translator.trans("funds.forum.error").toString();

      if (error instanceof ServiceError) {
        errorMessage = error.message;
      } else {
        errorMessage = extractErrorMessage(
          error as FlarumApiError,
          errorMessage
        );
      }

      app.alerts.show({ type: "error", dismissible: true }, errorMessage);
    } finally {
      this.state.submitting = false;
    }
  }

  // Deposit methods - simplified platform selection

  // 简化的存款处理方法
  private handleCancelDepositForm(): void {
    // 简单的取消操作，可以添加清空表单逻辑
    m.redraw();
  }

  private async handleDepositSubmit(data: DepositFormData): Promise<void> {
    if (this.state.submittingDeposit) return;

    this.state.submittingDeposit = true;
    m.redraw();

    try {
      await depositService.create(data);

      app.alerts.show(
        { type: "success", dismissible: true },
        app.translator.trans("funds.forum.deposit.form.submit_success")
      );

      // 重新加载存款记录
      await this.loadDepositRecords();

      // 切换到历史标签页显示刚提交的记录
      this.state.activeTab("history");
    } catch (error: unknown) {
      console.error("Deposit submission failed:", error);

      let errorMessage = app.translator
        .trans("funds.forum.deposit.form.submit_error")
        .toString();

      if (error instanceof ServiceError) {
        errorMessage = error.message;
      } else {
        errorMessage = extractErrorMessage(
          error as FlarumApiError,
          errorMessage
        );
      }

      app.alerts.show({ type: "error", dismissible: true }, errorMessage);
    } finally {
      this.state.submittingDeposit = false;
      m.redraw();
    }
  }

  // Data loading methods
  private async loadAllData(): Promise<void> {
    try {
      await Promise.all([
        this.loadWithdrawalData(),
        this.loadDepositData(),
        this.loadUserBalance(),
      ]);

      this.state.loading = false;
      m.redraw();
    } catch (error) {
      console.error("Error loading data:", error);
      this.state.loading = false;
      m.redraw();
    }
  }

  /**
   * Load withdrawal platforms and user requests using service layer
   */
  private async loadWithdrawalData(): Promise<void> {
    try {
      const [platforms, requests] = await Promise.all([
        platformService.getActive("withdrawal"),
        withdrawalService.getUserHistory(),
      ]);

      this.state.withdrawalPlatforms = platforms as WithdrawalPlatform[];
      this.state.withdrawalRequests = requests;
    } catch (error) {
      console.error("Error loading withdrawal data:", error);
      // Fallback to empty arrays
      this.state.withdrawalPlatforms = [];
      this.state.withdrawalRequests = [];
    }
  }

  /**
   * Load deposit platforms and user records using service layer
   */
  private async loadDepositData(): Promise<void> {
    try {
      const [platforms, records] = await Promise.all([
        platformService.getActive("deposit"),
        depositService.getUserHistory(),
      ]);

      this.state.depositPlatforms = platforms;
      this.state.depositRecords = records;
    } catch (error) {
      console.error("Error loading deposit data:", error);
      // Fallback to empty arrays
      this.state.depositPlatforms = [];
      this.state.depositRecords = [];
    }
  }

  /**
   * 加载简化的存款记录（用于表单提交后刷新）
   */
  private async loadDepositRecords(): Promise<void> {
    try {
      const records = await depositService.getUserHistory();
      this.state.depositRecords = records;
    } catch (error) {
      console.error("Error loading deposit records:", error);
      this.state.depositRecords = [];
    }
  }

  private async loadUserBalance(forceRefresh = false): Promise<void> {
    try {
      this.state.loadingBalance = true;

      if (forceRefresh && app.session.user) {
        const userId = app.session.user.id();
        if (!userId) {
          throw new Error("User ID not available");
        }

        // Refresh user data through the store
        const updatedUser = await app.store.find("users", userId);

        if (updatedUser) {
          this.state.userBalance =
            parseFloat(updatedUser.attribute("money")) || 0;
        } else {
          this.state.userBalance = 0;
        }
      } else {
        this.state.userBalance = parseFloat(
          app.session.user?.attribute("money") || "0"
        );
      }

      this.state.loadingBalance = false;
      m.redraw();
    } catch (error) {
      console.error("Error loading user balance:", error);
      this.state.loadingBalance = false;
      m.redraw();
    }
  }

  private async loadWithdrawalRequests(): Promise<void> {
    try {
      const requests = await withdrawalService.getUserHistory();
      this.state.withdrawalRequests = requests;
    } catch (error) {
      console.error("Error loading withdrawal requests:", error);
      this.state.withdrawalRequests = [];
    }
  }
}

import Component from 'flarum/common/Component';
import type Mithril from 'mithril';
import type { WithdrawalFormData } from '../types/interfaces';
import WithdrawalPlatform from '../../../../common/models/WithdrawalPlatform';
import PlatformSelector from './PlatformSelector';
import AmountInput from './AmountInput';
import AddressInput from './AddressInput';
import MessageInput from './MessageInput';
import SubmitButton from './SubmitButton';

interface WithdrawalFormProps {
  platforms: WithdrawalPlatform[];
  formData: WithdrawalFormData;
  loadingBalance: boolean;
  submitting: boolean;
  onFormDataChange: (data: Partial<WithdrawalFormData>) => void;
  onFillAllAmount: () => void;
  onSubmit: () => void;
}

export default class WithdrawalForm extends Component<WithdrawalFormProps> {
  view(): Mithril.Children {
    const { 
      platforms, 
      formData, 
      loadingBalance,
      submitting,
      onFormDataChange,
      onFillAllAmount,
      onSubmit 
    } = this.attrs;

    return [
      <PlatformSelector 
        platforms={platforms}
        selectedPlatform={formData.selectedPlatform}
        onPlatformSelect={(platform) => onFormDataChange({ selectedPlatform: platform })}
        onAmountChange={() => onFormDataChange({ amount: '' })}
      />,
      
      <AmountInput 
        amount={formData.amount}
        selectedPlatform={formData.selectedPlatform}
        loadingBalance={loadingBalance}
        onAmountChange={(amount) => onFormDataChange({ amount })}
        onFillAllAmount={onFillAllAmount}
      />,
      
      <AddressInput 
        accountDetails={formData.accountDetails}
        selectedPlatform={formData.selectedPlatform}
        saveAddress={formData.saveAddress}
        onAccountDetailsChange={(accountDetails) => onFormDataChange({ accountDetails })}
        onSaveAddressToggle={(saveAddress) => onFormDataChange({ saveAddress })}
      />,
      
      <MessageInput 
        message={formData.message}
        onMessageChange={(message) => onFormDataChange({ message })}
      />,
      
      <SubmitButton 
        amount={formData.amount}
        selectedPlatform={formData.selectedPlatform}
        accountDetails={formData.accountDetails}
        submitting={submitting}
        canSubmit={this.canSubmit()}
        onSubmit={onSubmit}
      />
    ];
  }

  private canSubmit(): boolean {
    const { formData, submitting } = this.attrs;
    const { selectedPlatform, amount, accountDetails } = formData;

    return !!(
      selectedPlatform &&
      amount &&
      accountDetails &&
      !submitting &&
      parseFloat(amount) > 0
    );
  }
}
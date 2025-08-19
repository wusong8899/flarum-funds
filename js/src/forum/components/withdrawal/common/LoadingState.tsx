import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import type Mithril from 'mithril';

interface LoadingStateProps {
  className?: string;
}

export default function LoadingState(props: LoadingStateProps): Mithril.Children {
  const { className = '' } = props;
  
  return (
    <div className={`WithdrawalPage-loading ${className}`}>
      <LoadingIndicator />
    </div>
  );
}
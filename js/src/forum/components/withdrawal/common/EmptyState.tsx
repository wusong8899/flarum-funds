import Component from 'flarum/common/Component';
import icon from 'flarum/common/helpers/icon';
import type Mithril from 'mithril';

interface EmptyStateProps {
  iconName: string;
  title: string;
  description: string;
  className?: string;
}

export default class EmptyState extends Component<EmptyStateProps> {
  view(): Mithril.Children {
    const { iconName, title, description, className = '' } = this.attrs;
    
    return (
      <div className={`FundsPage-emptyState ${className}`}>
        <div className="FundsPage-emptyIcon">
          {icon(iconName)}
        </div>
        <h3 className="FundsPage-emptyTitle">
          {title}
        </h3>
        <p className="FundsPage-emptyDescription">
          {description}
        </p>
      </div>
    );
  }
}
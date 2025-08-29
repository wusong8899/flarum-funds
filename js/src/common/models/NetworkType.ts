import Model from 'flarum/common/Model';

export default class NetworkType extends Model {
  id = Model.attribute<number>('id');
  name = Model.attribute<string>('name');
  code = Model.attribute<string>('code');
  description = Model.attribute<string>('description');
  iconUrl = Model.attribute<string>('iconUrl');
  iconClass = Model.attribute<string>('iconClass');
  config = Model.attribute<Record<string, any>>('config');
  isActive = Model.attribute<boolean>('isActive');
  sortOrder = Model.attribute<number>('sortOrder');
  createdAt = Model.attribute<Date>('createdAt', Model.transformDate);
  updatedAt = Model.attribute<Date>('updatedAt', Model.transformDate);
}
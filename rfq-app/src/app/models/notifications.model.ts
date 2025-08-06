export class Lookup {
  public id!: number;
  public name!: string;
}

export class SignalRNotification {
  public id!: number;
  public title!: string;
  public description!: string;
  public type!: Lookup;
  public status!: Lookup;
  public dateSent!: string;
  public data!: string;
}

export class UnreadNotificationsCount {
  public count!: number;
}

export class Paging {
  public pageNumber: number = 1;
  public pageSize: number = 10;
}

export class Sorting {
  public field: number = 1;
  public sortOrder: number = 1;
}

export class NotificationItem {
  public id!: number;
  public userId!: number;
  public title!: string;
  public description!: string;
  public data!: string;
  public type!: Lookup;
  public status!: Lookup;
  public created!: string;
}

export class NotificationSearchParams {
  public query: string = '';
  public paging: Paging = new Paging();
  public sorting: Sorting = new Sorting();
  public status?: number;
}

export class NotificationPagedResponse {
  public items!: NotificationItem[];
  public pageNumber!: number;
  public totalPages!: number;
  public totalCount!: number;
  public hasPreviousPage!: boolean;
  public hasNextPage!: boolean;
}
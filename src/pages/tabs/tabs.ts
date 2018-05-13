import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { EventsPage } from '../events/events';
import { PublicEventsPage } from '../public-events/public-events';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = EventsPage;
  tab2Root = PublicEventsPage;

  constructor() {

  }
}

import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';
import { Post } from '../../models/post';
import { BlogProvider } from '../../providers/blog/blog';
import { ISubscription } from 'rxjs/Subscription';
import { EditPostPage } from '../edit-post/edit-post';
import { PostPage } from '../post/post';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-event-blog',
  templateUrl: 'event-blog.html',
})
export class EventBlogPage implements OnInit {

  event: Event;
  subscriptions: ISubscription[] = [];
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  searchText = '';
  isAdmin = false;
  userId: string;
  userEmail: string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private blogProvider: BlogProvider,
    private mProv: MessagingProvider,
    private afAuth: AngularFireAuth,
  ) {
    

  }

  ngOnInit(): void {  
    this.event = this.navParams.data;
    this.userId = this.afAuth.auth.currentUser.uid;
    this.userEmail = this.afAuth.auth.currentUser.email; 
    if(this.event.creatorId && this.event.creatorId === this.userId ){
        this.isAdmin = true;
    }
    else{
      if(this.event.creatorEmail === this.userEmail ){
        this.isAdmin = true;
      }
    }
   
    let loader = this.mProv.getLoader('Loading blog posts...');
    loader.present();
    let postSubs = this.blogProvider.getPostsByEvent(this.event.id)
    .map(posts => posts.filter(post => post != null && post.title.toLowerCase().includes(this.searchText.toLowerCase())))
    .subscribe(posts => {
      loader.dismiss();
      this.posts = posts;
      this.changeSearch();
    })
    this.subscriptions.push(postSubs);
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  addPost(){
    this.navCtrl.push(EditPostPage, {'event' : this.event, 'create': true});
  }

  openPost(post: Post){
    this.navCtrl.push(PostPage, {'post': post ,'event': this.event});
  }

  changeSearch() {
    this.filteredPosts = this.posts.filter(post => post.title.toLowerCase().includes(this.searchText.toLowerCase()));
  }

}

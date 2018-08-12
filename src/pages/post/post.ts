import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Post } from '../../models/post';
import { Comment } from '../../models/comment';
import { EditPostPage } from '../edit-post/edit-post';
import { Event } from '../../models/event';
import { AngularFireAuth } from 'angularfire2/auth';
import { EditCommentPage } from '../edit-comment/edit-comment';
import { BlogProvider } from '../../providers/blog/blog';
import { ISubscription } from 'rxjs/Subscription';
import { MessagingProvider } from '../../providers/messaging/messaging';

@IonicPage()
@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
})
export class PostPage implements OnInit {

  event: Event;
  post: Post;
  comments: Comment[] = [];
  isAdmin = false;
  isAdminOrCreator = false;
  subscriptions: ISubscription[] = [];
  userId: string;
  userEmail: string;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private blogProvider: BlogProvider,
    private mProv: MessagingProvider
  ) 
  {
  }

  ngOnInit(){
    this.userId = this.afAuth.auth.currentUser.uid;
    this.userEmail = this.afAuth.auth.currentUser.email;

    let post = this.navParams.get('post');
    this.event = this.navParams.get('event');
    let blogSubs = this.blogProvider.getPost(post.id).subscribe(post => {
      if(!post){
        this.mProv.showAlertOkMessage('Post Deleted', 'This post has been deleted.');
        this.navCtrl.pop();
        return;
      }
      this.post = post;
      if(this.event.creatorId){
        if(this.post.authorId === this.userId || this.event.creatorId === this.userId){
          this.isAdminOrCreator = true;
        }
        if(this.event.creatorId === this.userId ){
          this.isAdmin = true;
        }
      }
      else{
        if(this.post.authorId === this.userId || this.event.creatorEmail === this.userEmail){
          this.isAdminOrCreator = true;
        }
        if(this.event.creatorEmail === this.userEmail ){
          this.isAdmin = true;
        }
      }
    });
    this.subscriptions.push(blogSubs);

    let loader = this.mProv.getLoader('Loading comments...');
    loader.present();
    let commentSubs = this.blogProvider.getCommentsByPost(post.id)
    .subscribe(comments => {
      loader.dismiss();
      this.comments = comments;
    }, err => {
      loader.dismiss();
      console.log(err);
    });
    this.subscriptions.push(commentSubs);

  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());    
  }

  openEditPost(){
    this.navCtrl.push(EditPostPage, {'post': this.post, 'create': false});
  }

  addComment(){
    this.navCtrl.push(EditCommentPage, {'post': this.post, 'create': true});
  }

  editComment(comment: Comment){
    this.navCtrl.push(EditCommentPage, {'comment': comment, 'create': false});
  }

  

}

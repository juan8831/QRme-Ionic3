import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Post } from '../../models/post';
import { Comment } from '../../models/comment';
import { EditPostPage } from '../edit-post/edit-post';
import { Event } from '../../models/event';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
})
export class PostPage implements OnInit {

  event: Event;
  post: Post;
  comments: Comment[] = [];
  isAdminOrCreator = false;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afs: AngularFireAuth
  ) 
  {
  }

  ngOnInit(){
    this.post = this.navParams.get('post');
    this.event = this.navParams.get('event');

    if(this.event.creatorId){
      if(this.post.authorId === this.afs.auth.currentUser.uid || this.event.creatorId === this.afs.auth.currentUser.uid){
        this.isAdminOrCreator = true;
      }
    }
    else{
      if(this.post.authorId === this.afs.auth.currentUser.uid || this.event.creator === this.afs.auth.currentUser.email){
        this.isAdminOrCreator = true;
      }
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    
  }

  openEditPost(){
    this.navCtrl.push(EditPostPage, {'post': this.post, 'create': false});
  }

  

}

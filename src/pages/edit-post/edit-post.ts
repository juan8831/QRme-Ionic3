import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Event } from '../../models/event';
import { Post } from '../../models/post';
import { NgForm } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../../providers/user/user';
import { BlogProvider } from '../../providers/blog/blog';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { ErrorProvider } from '../../providers/error/error';

@IonicPage()
@Component({
  selector: 'page-edit-post',
  templateUrl: 'edit-post.html',
})
export class EditPostPage implements OnInit {

  event: Event;
  create = true;
  post: Post;
  pageName = 'EditPostPage';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private blogProvider: BlogProvider,
    private mProv: MessagingProvider,
    private alertCtrl: AlertController,
    private errorProvider: ErrorProvider
  ) {    
      this.create = this.navParams.get('create');
  }

  ngOnInit(){
    if(this.create){
      this.post = new Post();
      this.event = this.navParams.get('event');
    }
    else{
      this.post = this.navParams.get('post');
    }
  }

  onSubmit(f: NgForm){
    
    this.post.title = f.value.title;
    this.post.message = f.value.message;

    if(this.create){    
      let loader = this.mProv.getLoader('Creating new blog post...');
      loader.present();
     
      this.post.date = new Date();
      this.post.authorId = this.afAuth.auth.currentUser.uid;
      this.post.authorName = this.userProvider.userProfile.name;
      this.post.eventId = this.event.id;
      this.blogProvider.createPost(this.post)
      .then(_=> {
        loader.dismiss();
        this.mProv.showToastMessage('Successfully created blog post!');
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not create blog post');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not create post');
      });
    }
    else{
      let loader = this.mProv.getLoader('Updating blog post...');
      loader.present();
      this.blogProvider.updatePost(this.post)
      .then(_=> {
        loader.dismiss();
        this.mProv.showToastMessage('Successfully updated blog post!');
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not update blog post');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not update post');
      });
    }
  }

  showDeleteConfirm(){

    let confirm = this.alertCtrl.create({
      title: 'Delete?',
      message: 'Are you sure you want to delete this blog post?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deletePost();
          }
        },
        {
          text: 'No',
        }
      ]
    });
    confirm.present();
  }

  deletePost(){
    let loader = this.mProv.getLoader('Deleting blog post...');
    loader.present();
    this.blogProvider.deletePost(this.post)
      .then(_ => {
        loader.dismiss();
        this.mProv.showToastMessage('Blog post successfully deleted.');
        this.navCtrl.pop();
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not delete blog post. Please try again later.');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not delete post');
      })
  }

}

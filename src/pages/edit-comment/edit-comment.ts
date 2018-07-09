import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Post } from '../../models/post';
import { Comment } from '../../models/comment';
import { NgForm } from '@angular/forms';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../../providers/user/user';
import { BlogProvider } from '../../providers/blog/blog';

/**
 * Generated class for the EditCommentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-comment',
  templateUrl: 'edit-comment.html',
})
export class EditCommentPage implements OnInit {

  comment: Comment;
  post: Post;
  create = true;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private mProv: MessagingProvider,
    private afAuth: AngularFireAuth,
    private alertCtrl: AlertController,
    private userProvider: UserProvider,
    private blogProvider: BlogProvider
  ) {
  }

  ngOnInit(){
    this.create = this.navParams.get('create');
    if(this.create){
      this.comment = new Comment();
      this.post = this.navParams.get('post');
    }
    else{
      this.comment = this.navParams.get('comment');
    }
  }

  onSubmit(f: NgForm){
    
    this.comment.message = f.value.message;

    if(this.create){    
      let loader = this.mProv.getLoader('Adding new comment...');
      loader.present();
      this.comment.date = new Date();
      this.comment.authorId = this.afAuth.auth.currentUser.uid;
      this.comment.authorName = this.userProvider.userProfile.name;
      this.comment.postId = this.post.id
      this.blogProvider.createComment(this.comment)
      .then(_=> {
        loader.dismiss();
        this.mProv.showToastMessage('Successfully added comment!');
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not add comment.');
        console.log(err);
      });
    }
    else{
      let loader = this.mProv.getLoader('Updating comment...');
      loader.present();
      this.blogProvider.updateComment(this.comment)
      .then(_=> {
        loader.dismiss();
        this.mProv.showToastMessage('Successfully updated comment!');
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not update comment');
        console.log(err);
      });
    }
  }

  showDeleteConfirm(){

    let confirm = this.alertCtrl.create({
      title: 'Delete?',
      message: 'Are you sure you want to delete this comment?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deleteComment();
          }
        },
        {
          text: 'No',
        }
      ]
    });
    confirm.present();
  }

  deleteComment(){
    let loader = this.mProv.getLoader('Deleting comment...');
    loader.present();
    this.blogProvider.deleteComment(this.comment)
      .then(_ => {
        loader.dismiss();
        this.mProv.showToastMessage('Comment successfully deleted.');
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not delete comment. Please try again later.');
        console.log(err);
      })
  }


}

import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Post } from '../../models/post';
import { Comment } from '../../models/comment';
import { NgForm } from '@angular/forms';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../../providers/user/user';
import { BlogProvider } from '../../providers/blog/blog';
import { ErrorProvider } from '../../providers/error/error';

@IonicPage()
@Component({
  selector: 'page-edit-comment',
  templateUrl: 'edit-comment.html',
})
export class EditCommentPage implements OnInit {

  comment: Comment;
  post: Post;
  create = true;
  pageName = 'EditCommentPage';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private mProv: MessagingProvider,
    private afAuth: AngularFireAuth,
    private alertCtrl: AlertController,
    private userProvider: UserProvider,
    private blogProvider: BlogProvider,
    private errorProvider: ErrorProvider
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
        this.errorProvider.reportError(this.pageName, err, this.post.eventId, 'Could not add comment');
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
        this.errorProvider.reportError(this.pageName, err, this.post.eventId, 'Could not update comment');
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
        this.errorProvider.reportError(this.pageName, err, this.post.eventId, 'Could not delete comment');
      })
  }


}

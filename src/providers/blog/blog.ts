import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../user/user';
import { FirebaseApp } from 'angularfire2';
import { Post } from '../../models/post';
import { Comment } from '../../models/comment';

@Injectable()
export class BlogProvider {

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private fb: FirebaseApp

  ) {

  }

  createPost(post: Post) {
    const postCollection = this.afs.collection<Post>('posts');
    return postCollection.add(Object.assign({}, post));
  }

  deletePost(post: Post) {
    const postDoc = this.afs.doc(`posts/${post.id}`);
    return postDoc.delete();
  }

  updatePost(post: Post) {
    const postDoc = this.afs.doc(`posts/${post.id}`);
    return postDoc.update(Object.assign({}, post));
  }

  getPost(id: string) {
    const postDoc = this.afs.doc(`posts/${id}`);
    if (id = null) return null;
    return postDoc.snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data() as Post;
        data.id = action.payload.id;
        return data;
      }
    });
  }

  getPostsByEvent(eventId: string) {
    let postCollection = this.afs.collection('posts', ref => ref
      .where('eventId', '==', eventId)
      .orderBy('date', 'asc'));
    return postCollection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as Post;
        data.id = action.payload.doc.id;
        return data;
      });
    });
  }

  getCommentsByPost(postId) {
    let commentsCollection = this.afs.doc(`posts/${postId}`).collection('comments', ref => ref
    .orderBy('date', 'desc'));
    return commentsCollection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as Comment;
        data.id = action.payload.doc.id;
        return data;
      });
    });
  }

  getComment(postId, commentId) {
    const commentDoc = this.afs.collection(`posts/${postId}`).doc(`comments/${commentId}`);
    if (postId = null || commentId == null) return null;
    return commentDoc.snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data() as Comment;
        data.id = action.payload.id;
        return data;
      }
    });
  }

  createComment(comment: Comment) {
    const commentsCollection = this.afs.doc(`posts/${comment.postId}`).collection('comments');
    return commentsCollection.add(Object.assign({}, comment));
  }

  deleteComment(comment: Comment) {
    const commentDoc = this.afs.doc(`posts/${comment.postId}`).collection('comments').doc(`${comment.id}`);
    return commentDoc.delete();
  }

  updateComment(comment: Comment) {
    const commentDoc = this.afs.doc(`posts/${comment.postId}`).collection('comments').doc(`${comment.id}`);
    return commentDoc.update(Object.assign({}, comment));
  }

}

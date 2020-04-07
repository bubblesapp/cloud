import admin from 'firebase-admin';
import firebaseTesting from '@firebase/testing';

export type Firestore = admin.firestore.Firestore | firebaseTesting.firestore.Firestore;

export type DocumentReference =
  | admin.firestore.DocumentReference
  | firebaseTesting.firestore.DocumentReference;

export type CollectionReference =
  | admin.firestore.CollectionReference
  | firebaseTesting.firestore.CollectionReference;

export type Query = admin.firestore.Query | firebaseTesting.firestore.Query;

export type DocumentSnapshot =
  | admin.firestore.DocumentSnapshot
  | firebaseTesting.firestore.DocumentSnapshot;

export type QuerySnapshot = admin.firestore.QuerySnapshot | firebaseTesting.firestore.QuerySnapshot;

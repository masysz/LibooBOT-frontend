// src/services/campaignService.js
import { db } from '../firebase';

export const getCampaigns = async () => {
  const snapshot = await db.collection('campaigns').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const donatePoints = async (campaignId, points, userId) => {
  const campaignRef = db.collection('campaigns').doc(campaignId);
  const userRef = db.collection('users').doc(userId);

  await db.runTransaction(async (transaction) => {
    const campaignDoc = await transaction.get(campaignRef);
    const userDoc = await transaction.get(userRef);

    if (!campaignDoc.exists || !userDoc.exists) {
      throw 'Document does not exist!';
    }

    const newPointsRaised = campaignDoc.data().pointsRaised + points;
    const newUserPoints = userDoc.data().points - points;

    if (newUserPoints < 0) {
      throw 'Insufficient points!';
    }

    transaction.update(campaignRef, { pointsRaised: newPointsRaised });
    transaction.update(userRef, { points: newUserPoints });
  });
};

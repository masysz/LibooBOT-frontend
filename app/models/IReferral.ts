export interface ReferralCreationRequest {
  /**
   * The referrer ID of the user who referred someone
   */
  referrerId: string;

  /**
   * The username of the user who was referred
   */
  userId: string;
}

export interface BonusClaimRequest {
    /**
     * The user ID of the user claiming the bonus
     */
    userId: string;
    
    /**
     * The number of referrals to be claimed for
     */
    referralCount: number;
}

export interface PitchCategory {
	CategoryId?: number;
	userId: number;
	CategoryName: string;
	CategoryModelDetails: string;
	KeyPoints?: string | null;
	PitchGoodPoints?: string | null;
	PointsNotAddedIntoPitch?: string | null;
	created_by: number;
}

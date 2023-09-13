import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedDeliveryTypeEnum1693936563006 implements MigrationInterface {
    name = 'UpdatedDeliveryTypeEnum1693936563006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "messageRetentionDuration" SET DEFAULT '10'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "messageRetentionDuration" DROP DEFAULT`);
    }

}

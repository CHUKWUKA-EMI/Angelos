import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedSubscriptionEntity1693966554349 implements MigrationInterface {
    name = 'UpdatedSubscriptionEntity1693966554349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription" DROP COLUMN "deliveryType"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_deliverytype_enum"`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD CONSTRAINT "UQ_9e5c9733b3b3d58f3d3e7ef8078" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "endpointUrl" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "endpointUrl" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "UQ_9e5c9733b3b3d58f3d3e7ef8078"`);
        await queryRunner.query(`CREATE TYPE "public"."subscription_deliverytype_enum" AS ENUM('PULL', 'PUSH')`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD "deliveryType" "public"."subscription_deliverytype_enum" NOT NULL`);
    }

}

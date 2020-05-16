import TileHandle from "./tile_handle";

class TileHandleA1 extends TileHandle {

  static SPECIAL_A1_TILE_ID = [1,2,3];
  static AUTO_A1_TILE_INDEX = [0,1,2,3,4,6,8,10,12,14]; 

  constructor(x,y,config_str){
    super(x,y);
    const config_arr = config_str.split("|");
    this.tile_x = parseInt(config_arr[3]);
    this.tile_y = parseInt(config_arr[2]);
    this.tile_index = (this.tile_x + this.tile_y * 8);
    this.start_tile_id = Tilemap.TILE_ID_A1;
    this.tile_id = this.start_tile_id + this.tile_index * 48;

    // A1 私有属性
    this.is_auto_tile = TileHandleA1.AUTO_A1_TILE_INDEX.includes(this.tile_index);
    this.is_special_tile = TileHandleA1.SPECIAL_A1_TILE_ID.includes(this.tile_index);
  }

  static createTileHandleA1(x,y,tile_id){
    const tile_index = parseInt(tile_id - Tilemap.TILE_ID_A2) / 48;
    const tile_x = tile_index % 8;
    const tile_y = tile_index / 8;
    const config_str = `||${tile_y}|${tile_x}`;
    const tile_handle = new TileHandleA1(x,y,config_str);
    return tile_handle;
  }

  refresh(){
    if (this.checkTileIsPadding(this.x,this.y)) {
      return;
    }
    this.refreshCore();
    SceneManager._scene._spriteset._tilemap.refresh();
  }

  // 根据index查询tile_id是否为范围内(48个组成之一)
  isCurrentTileByIndex(index,tile_id,layer){
    if (index < 0) return false;
    const target_tile_id = $dataMap.data[index + layer * $gameMap.gridCount()];
    return target_tile_id >= tile_id && target_tile_id < tile_id + 48;
  }

  // 根据pos查询tile_id是否为范围内(48个组成之一)
  isCurrentTile(x,y,tile_id,layer){
    const target_index = x + y * $gameMap.width();
    return this.isCurrentTileByIndex(target_index,tile_id,layer);
  };

  // 通过 index 获取 tile_id 的 index
  getTileIndexByTileId(tile_id){
    return parseInt((tile_id - this.start_tile_id) / 48);
  };

  // 通过 pos 获取 tile_index
  getTileIndexByTilePos(x,y,layer){
    const tile_id = this.getTileIdByPos(x,y,layer);
    const tile_index = this.getTileIndexByTileId(tile_id);
    return tile_index;
  };

  // 通过 pos 检查当前位置是否为 auto_tile
  checkIsAutoTileByPos(x,y,layer){
    const tile_index = this.getTileIndexByTilePos(x,y,layer);
    return TileHandleA1.AUTO_A1_TILE_INDEX.includes(tile_index);
  };

  // 通过 tile_id 检测是否为自动图块
  checkIsAutoTileByTileId(tile_id){
    const tile_index = this.getTileIndexByTileId(tile_id);
    return TileHandleA1.AUTO_A1_TILE_INDEX.includes(tile_index);
  };

  // 通过 tile_id 检测是否为特殊图块
  checkIsSpecialTileByTileId(tile_id){
    const tile_index = this.getTileIndexByTileId(tile_id);
    const is_special_tile = TileHandleA1.SPECIAL_A1_TILE_ID.includes(tile_index);
    return is_special_tile;
  }

  // 通过 tile pos 检查是否 特殊自动元件
  checkIsSpecialTileByTilePos(tile_x,tile_y,layer){
    const start_tile_index = (tile_x + tile_y * 8);
    const tile_id = this.start_tile_id + start_tile_index * 48;
    const tile_index = this.getTileIndexByTileId(tile_id);
    const is_special_tile = TileHandleA1.SPECIAL_A1_TILE_ID.includes(tile_index);
    return is_special_tile;
  };


  clearTileLayerByPos(x,y,layer){
    const target_index = x + y * $gameMap.width();
    const clear_target_id = $dataMap.data[target_index + layer * $gameMap.gridCount()];
    if (clear_target_id !== 0){
      $dataMap.data[target_index + layer * $gameMap.gridCount()] = 0;
    }
  };

  refreshCore(){
    const x = this.x;
    const y = this.y;

    // stap1 清空当前坐标的 tile (第一, 第二层)
    this.clearTileLayerByPos(x,y,0);
    this.clearTileLayerByPos(x,y,1);

    // step2 根据周围8格情况绘制当前坐标x,y的 tile (中心点强迫绘制)
    this.drawCurrentPosTile();

    // step3 更新周围8格的 tile (第一, 第二层)
    // 如果当前不是 自动元件, 周围是自动元件, 则不更新周围
    if (!this.checkIsAutoTileByPos(x,y,0)){
      if (this.checkIsAutoTileByPos(x-1, y, 0)){
        return;
      }
      if (this.checkIsAutoTileByPos(x-1, y-1, 0)){
        return;
      }
      if (this.checkIsAutoTileByPos(x, y-1, 0)){
        return;
      }
      if (this.checkIsAutoTileByPos(x+1, y-1, 0)){
        return;
      }
      if (this.checkIsAutoTileByPos(x+1, y, 0)){
        return;
      }
      if (this.checkIsAutoTileByPos(x+1, y+1, 0)){
        return;
      }
      if (this.checkIsAutoTileByPos(x, y+1, 0)){
        return;
      }
      if (this.checkIsAutoTileByPos(x-1, y+1, 0)){
        return;
      }
    }

    // 更新周围的8格
    this.drawAround(x,y);
  }

  // 更新周围的8格
  drawAround(x,y){
    this.drawTileByPos(x-1, y);
    this.drawTileByPos(x-1, y-1);
    this.drawTileByPos(x, y-1);
    this.drawTileByPos(x+1, y-1);
    this.drawTileByPos(x+1, y);
    this.drawTileByPos(x+1, y+1);
    this.drawTileByPos(x, y+1);
    this.drawTileByPos(x-1, y+1);
  }

  drawTileByPosA1(x,y,tile_id,layer){
    const start_tile_id = tile_id - (tile_id - this.start_tile_id) % 48;
    const is_special_tile = this.checkIsSpecialTileByTileId(start_tile_id);
    const is_auto_tile = this.checkIsAutoTileByTileId(start_tile_id);

    if (is_special_tile){
      this.drawTileCore(x, y,this.start_tile_id,is_auto_tile,0);
      this.drawTileCore(x, y,start_tile_id,is_auto_tile,1);
    } else {
      this.drawTileCore(x, y,start_tile_id,is_auto_tile,layer);
    }
  }

  // 绘制当前位置的 tile
  drawCurrentPosTile(){
    // 超过边界则返回
    if (this.checkTileIsPadding(this.x,this.y)) {
      return;
    }
    if (this.is_special_tile){
      this.drawTileCore(this.x, this.y, this.start_tile_id, this.is_auto_tile, 0);
      this.drawTileCore(this.x, this.y, this.tile_id, this.is_auto_tile, 1);
    } else {
      this.drawTileCore(this.x, this.y, this.tile_id, this.is_auto_tile, 0);
    }
  }


  // 设置光标位置tile到地图 -> 在 x,y,layer 上绘制 tile_id
  // 检测周边是否同类tile, 在 start_tile_id 上加上 内部 inner_tile_id 来绘制
  drawTileCore(x,y,start_tile_id,is_auto_tile,layer){
    if (!start_tile_id || start_tile_id === 0) return;

    // 最终需要绘制的 tile_id;
    let tile_id = start_tile_id;

    // 自动图块绘制
    if (is_auto_tile){

      // 根据周围8各自计算出 需要增加的 inner_tile_id
      let inner_tile_id = this.getCenterTileIdByAround(x,y,tile_id,layer);
      tile_id += inner_tile_id

    } else {

      // 普通A1图块(非Auto)根据左右情况计算出 需要增加的 inner_tile_id
      // 非自动图块绘制则根据 index 的规则 -> (左中中中...中中中右) (+1,0,0,0,+2), 单个独立这 +3
      const inner_tile_id = this.getTileidByLeftAndRight(x,y,tile_id,layer);
      tile_id += inner_tile_id
    }

    const map_width = $gameMap.width();
    const pos_index = x + y * map_width;

    $dataMap.data[pos_index + layer * $gameMap.gridCount()] = tile_id;
  }


  // 扫描检测周边格子是满足条件, conditions 为一组周边8个格子的情况 -> 0: 不包含 1: 包含  null: 不检测跳过
  // 超过地图边界这返回 -> 包含
  conditionScanRoundTiles(conditions, x, y, tile_id, layer){

    const pos_left  = [x-1, y];
    const pos_up    = [x, y-1];
    const pos_right = [x+1, y];
    const pos_down  = [x, y+1];
    const pos_left_top   = [x-1, y-1];
    const pos_right_top  = [x+1, y-1];
    const pos_left_down  = [x-1, y+1];
    const pos_right_down = [x+1, y+1];

    let result = true;
    for(let i = 0; i < conditions.length; i++){
      if (conditions[i] === null){
        continue;
      }
      let dir = i + 1;
      let exist = conditions[i] === 1;

      if (dir === 1){
        if (exist !== (this.checkTileIsPadding(pos_left_down[0],pos_left_down[1]) || this.isCurrentTile(pos_left_down[0],pos_left_down[1],tile_id,layer))){
          result = false;
          break;
        }
      }
      if (dir === 2){
        if (exist !== (this.checkTileIsPadding(pos_down[0],pos_down[1]) || this.isCurrentTile(pos_down[0],pos_down[1],tile_id,layer))){
          result = false;
          break;
        }
      }
      if (dir === 3){
        if (exist !== (this.checkTileIsPadding(pos_right_down[0],pos_right_down[1]) || this.isCurrentTile(pos_right_down[0],pos_right_down[1],tile_id,layer))){
          result = false;
          break;
        }
      }
      if (dir === 4){
        if (exist !== (this.checkTileIsPadding(pos_left[0],pos_left[1]) || this.isCurrentTile(pos_left[0],pos_left[1],tile_id,layer))){
          result = false;
          break;
        }
      }
      if (dir === 6){
        if (exist !== (this.checkTileIsPadding(pos_right[0],pos_right[1]) || this.isCurrentTile(pos_right[0],pos_right[1],tile_id,layer))){
          result = false;
          break;
        }
      }
      if (dir === 7){
        if (exist !== (this.checkTileIsPadding(pos_left_top[0],pos_left_top[1]) || this.isCurrentTile(pos_left_top[0],pos_left_top[1],tile_id,layer))){
          result = false;
          break;
        }
      }
      if (dir === 8){
        if (exist !== (this.checkTileIsPadding(pos_up[0],pos_up[1]) || this.isCurrentTile(pos_up[0],pos_up[1],tile_id,layer))){
          result = false;
          break;
        }
      }
      if (dir === 9){
        if (exist !== (this.checkTileIsPadding(pos_right_top[0],pos_right_top[1]) || this.isCurrentTile(pos_right_top[0],pos_right_top[1],tile_id,layer))){
          result = false;
          break;
        }
      }
      
    }
    return result;
  }


  // 普通A1图块(非Auto)根据左右情况计算出 需要增加的 inner_tile_id
  getTileidByLeftAndRight(x,y,tile_id,layer){
    const current_target_index = y * $gameMap.width() + x;
    let inner_target_id;
    if ( 
      this.isCurrentTileByIndex(current_target_index - 1,tile_id,layer) &&
      this.isCurrentTileByIndex(current_target_index + 1,tile_id,layer))
    {
      inner_target_id = 0;
    } else if (
      !this.isCurrentTileByIndex(current_target_index - 1,tile_id,layer) &&
      !this.isCurrentTileByIndex(current_target_index + 1,tile_id,layer)) 
    {
      inner_target_id = 3;
    } else if (
      this.isCurrentTileByIndex(current_target_index - 1,tile_id,layer) &&
      !this.isCurrentTileByIndex(current_target_index + 1,tile_id,layer)) 
    {
      inner_target_id = 2;
    } else if (
      !this.isCurrentTileByIndex(current_target_index - 1,tile_id,layer) &&
      this.isCurrentTileByIndex(current_target_index + 1,tile_id,layer)) 
    {
      inner_target_id = 1;
    }
    return inner_target_id;
  }

  // 检测周边tile_id状况来获取中心tile的内部tile_id
  getCenterTileIdByAround(x,y,tile_id,layer){

    let center_inner_target_id;
    if (this.conditionScanRoundTiles([1,1,1,1,null,1,1,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 0;
    } 
    else if (this.conditionScanRoundTiles([1,1,1,1,null,1,0,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 1;
    }
    else if (this.conditionScanRoundTiles([1,1,1,1,null,1,1,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 2;
    }
    else if (this.conditionScanRoundTiles([1,1,1,1,null,1,0,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 3;
    }
    else if (this.conditionScanRoundTiles([1,1,0,1,null,1,1,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 4;
    }
    else if (this.conditionScanRoundTiles([1,1,0,1,null,1,0,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 5;
    }
    else if (this.conditionScanRoundTiles([1,1,0,1,null,1,1,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 6;
    }
    else if (this.conditionScanRoundTiles([1,1,0,1,null,1,0,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 7;
    }
    else if (this.conditionScanRoundTiles([0,1,1,1,null,1,1,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 8;
    }
    else if (this.conditionScanRoundTiles([0,1,1,1,null,1,0,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 9;
    }
    else if (this.conditionScanRoundTiles([0,1,1,1,null,1,1,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 10;
    }
    else if (this.conditionScanRoundTiles([0,1,1,1,null,1,0,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 11;
    }
    else if (this.conditionScanRoundTiles([0,1,0,1,null,1,1,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 12;
    }
    else if (this.conditionScanRoundTiles([0,1,0,1,null,1,0,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 13;
    }
    else if (this.conditionScanRoundTiles([0,1,0,1,null,1,1,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 14;
    }
    else if (this.conditionScanRoundTiles([0,1,0,1,null,1,0,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 15;
    }
    else if (this.conditionScanRoundTiles([null,1,1,0,null,1,null,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 16;
    }
    else if (this.conditionScanRoundTiles([null,1,1,0,null,1,null,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 17;
    }
    else if (this.conditionScanRoundTiles([null,1,0,0,null,1,null,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 18;
    }
    else if (this.conditionScanRoundTiles([null,1,0,0,null,1,null,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 19;
    }
    else if (this.conditionScanRoundTiles([1,1,1,1,null,1,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 20;
    }
    else if (this.conditionScanRoundTiles([1,1,0,1,null,1,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 21;
    }
    else if (this.conditionScanRoundTiles([0,1,1,1,null,1,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 22;
    }
    else if (this.conditionScanRoundTiles([0,1,0,1,null,1,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 23;
    }
    else if (this.conditionScanRoundTiles([1,1,null,1,null,0,1,1,null],x,y,tile_id,layer)){
      center_inner_target_id = 24;
    }
    else if (this.conditionScanRoundTiles([0,1,null,1,null,0,1,1,null],x,y,tile_id,layer)){
      center_inner_target_id = 25;
    }
    else if (this.conditionScanRoundTiles([1,1,null,1,null,0,0,1,null],x,y,tile_id,layer)){
      center_inner_target_id = 26;
    }
    else if (this.conditionScanRoundTiles([0,1,null,1,null,0,0,1,null],x,y,tile_id,layer)){
      center_inner_target_id = 27;
    }
    else if (this.conditionScanRoundTiles([null,0,null,1,null,1,1,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 28;
    }
    else if (this.conditionScanRoundTiles([null,0,null,1,null,1,0,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 29;
    }
    else if (this.conditionScanRoundTiles([null,0,null,1,null,1,1,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 30;
    }
    else if (this.conditionScanRoundTiles([null,0,null,1,null,1,0,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 31;
    }
    else if (this.conditionScanRoundTiles([null,1,null,0,null,0,null,1,null],x,y,tile_id,layer)){
      center_inner_target_id = 32;
    }
    else if (this.conditionScanRoundTiles([null,0,null,1,null,1,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 33;
    }
    else if (this.conditionScanRoundTiles([null,1,1,0,null,1,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 34;
    }
    else if (this.conditionScanRoundTiles([null,1,null,0,null,1,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 35;
    }
    else if (this.conditionScanRoundTiles([1,1,null,1,null,0,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 36;
    }
    else if (this.conditionScanRoundTiles([0,1,null,1,null,0,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 37;
    }
    else if (this.conditionScanRoundTiles([null,0,null,1,null,0,1,1,null],x,y,tile_id,layer)){
      center_inner_target_id = 38;
    }
    else if (this.conditionScanRoundTiles([null,0,null,1,null,0,0,1,null],x,y,tile_id,layer)){
      center_inner_target_id = 39;
    }
    else if (this.conditionScanRoundTiles([null,0,null,0,null,1,null,1,1],x,y,tile_id,layer)){
      center_inner_target_id = 40;
    }
    else if (this.conditionScanRoundTiles([null,0,null,0,null,1,null,1,0],x,y,tile_id,layer)){
      center_inner_target_id = 41;
    }
    else if (this.conditionScanRoundTiles([null,1,null,0,null,0,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 42;
    }
    else if (this.conditionScanRoundTiles([null,0,null,0,null,1,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 43;
    }
    else if (this.conditionScanRoundTiles([null,0,null,0,null,0,null,1,null],x,y,tile_id,layer)){
      center_inner_target_id = 44;
    }
    else if (this.conditionScanRoundTiles([null,0,null,1,null,0,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 45;
    }
    else if (this.conditionScanRoundTiles([null,0,null,0,null,0,null,0,null],x,y,tile_id,layer)){
      center_inner_target_id = 46;
    }
    return center_inner_target_id;
  }
}

export default TileHandleA1;
